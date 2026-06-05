import express from "express";
import { authenticateAccessToken } from "../../middleware/Authenticate";
const chatRouter = express.Router();
import client from "@repo/db";

chatRouter.post(
  "/conversation/create",
  authenticateAccessToken,
  async (req, res) => {
    try {
      const { conversationType, otheruserIds } = req.body;
      const updatedOtherUser = new Set([...otheruserIds, req.user?.id]);

      const conversation = await client.conversation.create({
        data: {
          conversationType,
          members: {
            createMany: {
              data: [...updatedOtherUser].map((id: string) => ({
                userId: id,
              })),
            },
          },
        },
      });

      res
        .status(201)
        .json({ message: "Conversation Created Successfully", conversation });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },
);

chatRouter.get("/conversation", authenticateAccessToken, async (req, res) => {
  try {
    const conversations = await client.conversation.findMany({
      where: {
        members: {
          some: {
            userId: req.user?.id,
          },
        },
      },
      include: {
        // members: {
        //   select: {
        //     user: {
        //       select: {
        //         id: true,
        //         username: true,
        //         avatarId: true,
        //       },
        //     },
        //   },
        // },
        lastMessage: {
          select: {
            content: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const conversationsDTO = conversations.map((conversation) => {
      return {
        id: conversation.id,
        name: conversation.name,
        updatedAt: conversation.updatedAt,
        lastmessageContent: conversation.lastMessage?.content,
        username: conversation.lastMessage?.user.username,
      };
    });

    res.status(200).json({
      message: "Conversations fetched successfully",
      conversationsDTO,
    });
  } catch (error) {
    res.status(500).send(`Internal Server Error`);
  }
});

chatRouter.post(
  "/conversation/:conversationId/message",
  authenticateAccessToken,
  async (req, res) => {
    try {
      const conversationId = req.params.conversationId! as string;
      const { content } = req.body;

      const isUserConversation = await client.chatMember.findUnique({
        where: {
          userId_conversationId: {
            userId: req.user?.id!,
            conversationId,
          },
        },
      });

      if (!isUserConversation) return res.status(403).send("Forbidden");

      const result = await client.$transaction(async (tx) => {
        //   const new
        const newMessage = await tx.message.create({
          data: {
            content,
            conversationId,
            userId: req.user?.id!,
          },
        });
        await tx.conversation.update({
          where: {
            id: conversationId,
          },
          data: {
            lastMessageId: newMessage.id,
          },
        });

        return newMessage;
      });

      res.status(201).json({ message: "Message Created Successfully", result });
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  },
);

chatRouter.get(
  "/conversation/:conversationId/messages",
  authenticateAccessToken,
  async (req, res) => {
    try {
      const conversationId = req.params.conversationId! as string;
      const cursorId = req.query.cursorId! as string;

      const isUserConversation = await client.chatMember.findUnique({
        where: {
          userId_conversationId: {
            userId: req.user?.id!,
            conversationId,
          },
        },
      });

      if (!isUserConversation) return res.status(403).send("Forbidden");

      const messages = await client.message.findMany({
        where: {
          conversationId,
        },
        take: 20,
        ...(cursorId && {
          skip: 1,
          cursor: {
            id: cursorId,
          },
        }),
        orderBy: {
          createdAt: "desc",
        },
      });

      const updatedCursorId =
        messages.length > 0 ? messages[messages.length - 1].id : null;
      res.status(200).json({
        message: "Messages fetched succesfully",
        messages,
        updatedCursorId,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error");
    }
  },
);

chatRouter.patch(
  "/messages/:messageId/seen",
  authenticateAccessToken,
  async (req, res) => {
    try {
      const messageId = req.params.messageId! as string;

      const isMessageValid = await client.message.findFirst({
        where: {
          id: messageId,
          userId: req.user?.id,
        },
      });

      if (!isMessageValid) return res.status(403).send("Forbidden");
      const updatedMessage = await client.message.update({
        where: {
          id: messageId,
        },
        data: {
          seenAt: new Date(),
        },
      });

      res
        .status(200)
        .json({ message: "Message updated Successfulyy", updatedMessage });
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  },
);
