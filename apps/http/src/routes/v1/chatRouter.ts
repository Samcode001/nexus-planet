import express from "express";
import { authenticateAccessToken } from "../../middleware/Authenticate";
const chatRouter = express.Router();
import client from "@repo/db";

chatRouter.post("/conversation", authenticateAccessToken, async (req, res) => {
  try {
    const { conversationType, otheruserIds, name } = req.body;
    const updatedOtherUser = new Set([...otheruserIds, req.user?.id]);

    const isConversationExist = await client.conversation.findFirst({
      where: {
        AND: [
          {
            members: {
              some: {
                userId: otheruserIds[0],
              },
            },
          },
          {
            members: {
              some: {
                userId: req.user?.id,
              },
            },
          },
        ],
      },
    });

    if (isConversationExist)
      return res.status(401).send("Conversations already exist");

    const conversation = await client.conversation.create({
      data: {
        name,
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
});

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
        members: {
          select: {
            user: {
              select: {
                id: true,
                username: true,
                avatarId: true,
              },
            },
          },
        },
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

    const conversationsDTO: ConversationDTO[] = conversations.map(
      (conversation) => {
        const membersIds = conversation.members
          .filter((elem) => elem.user.id !== req.user?.id)
          .map((elem) => elem.user.id);

        return {
          id: conversation.id,
          name: conversation.name,
          usernames: conversation.members.filter((m) => m.user.id!),
          lastMessage: conversation.lastMessage,
          chatMembersIds: membersIds,
          updatedAt: conversation.updatedAt,
        };
      },
    );

    res.status(200).json({
      message: "Conversations fetched successfully",
      conversations: conversationsDTO,
    });
  } catch (error) {
    res.status(500).send(`Internal Server Error`);
  }
});

chatRouter.post(
  "/:conversationId/message",
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
        const message = await tx.message.create({
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
            lastMessageId: message.id,
          },
        });

        return message;
      });

      res
        .status(201)
        .json({ message: "Message Created Successfully", newMessage: result });
    } catch (error) {
      res.status(500).send("Internal Server Error");
      console.log("Erron on saving message", error);
    }
  },
);

chatRouter.get(
  "/:conversationId/messages",
  authenticateAccessToken,
  async (req, res) => {
    try {
      const conversationId = req.params.conversationId as string;
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

chatRouter.post(
  "/message-request",
  authenticateAccessToken,
  async (req, res) => {
    try {
      const { content, receiverId } = req.body;

      const isUserExist = await client.user.findUnique({
        where: {
          id: req.user?.id,
        },
      });

      if (!isUserExist) return res.status(404).send(`User not Exist`);

      const message = await client.messageRequest.create({
        data: {
          content,
          senderId: req.user?.id!,
          receiverId,
        },
      });

      res
        .status(201)
        .json({ message: "Message Saved", messageRequest: message });
    } catch (error) {
      res.status(500).send("Internal server Error ");
      console.log("Error on Message-request", error);
    }
  },
);

chatRouter.post(
  "/message-request/:messageRequestId/accept",
  authenticateAccessToken,
  async (req, res) => {
    try {
      const messageRequestId = req.params.messageRequestId! as string;

      const { name } = req.body;

      const messageRequest = await client.messageRequest.findUnique({
        where: {
          id: messageRequestId,
        },
      });

      if (!messageRequest)
        return res.status(404).send("No message Request Found");

      if (messageRequest.receiverId !== req.user?.id)
        return res.status(403).send("Frobidden");

      if (messageRequest.status !== "PENDING")
        return res.status(401).send("Mesaage Request Already Accepted/IGNORED");

      const isConversationsExist = await client.conversation.findFirst({
        where: {
          AND: [
            {
              members: {
                some: {
                  userId: messageRequest.senderId,
                },
              },
            },
            {
              members: {
                some: {
                  userId: req.user?.id,
                },
              },
            },
          ],
        },
      });

      if (isConversationsExist)
        return res.status(403).send("Conversation Already exist");

      const uniqueOtherUserIds = [
        messageRequest?.senderId,
        req.user?.id,
      ].filter((id): id is string => typeof id === "string");

      const result = await client.$transaction(
        async (tx) => {
          const conversation = await tx.conversation.create({
            data: {
              name,
              conversationType: "DIRECT",
              members: {
                createMany: {
                  data: [...uniqueOtherUserIds].map((id: string) => ({
                    userId: id,
                  })),
                },
              },
            },
            include: {
              members: {
                select: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                    },
                  },
                },
              },
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
          });

          const newMessage = await tx.message.create({
            data: {
              conversationId: conversation.id,
              content: messageRequest?.content,
              userId: messageRequest?.senderId,
            },
          });

          await tx.conversation.update({
            where: {
              id: conversation.id,
            },
            data: {
              lastMessageId: newMessage.id,
            },
          });

          await tx.messageRequest.update({
            where: {
              id: messageRequestId,
            },
            data: {
              status: "ACCEPTED",
            },
          });

          const updatedConversation = await tx.conversation.findUnique({
            where: {
              id: conversation.id,
            },
            include: {
              members: {
                select: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                    },
                  },
                },
              },
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
          });

          if (!updatedConversation)
            throw new Error("Error on getting updated Conversation");

          const membersIds = updatedConversation.members
            .filter((elem) => elem.user.id !== req.user?.id)
            .map((elem) => elem.user.id);

          const conversataionDTO: ConversationDTO = {
            id: updatedConversation.id,
            name: updatedConversation.name,
            usernames: updatedConversation.members.filter((m) => m.user.id!),
            lastMessage: updatedConversation.lastMessage,
            updatedAt: updatedConversation.updatedAt,
            chatMembersIds: membersIds,
          };

          return { conversataionDTO, newMessage };
        },
        {
          maxWait: 5000,
          timeout: 10000,
        },
      );

      res.status(200).json({
        message: "Conversation Created and Message Linked",
        conversation: result.conversataionDTO,
        newMessage: result.newMessage,
      });
    } catch (error) {
      res.status(500).send("Internal Server Error");
      console.log("Error on accepting message Request", error);
    }
  },
);

export default chatRouter;

interface ConversationDTO {
  id: string;
  name: string | null;
  usernames: IUsernames[];
  lastMessage: ILastMessage | null;
  updatedAt: Date;
  chatMembersIds: string[];
}
interface IUsernames {
  user: {
    id: string;
    username: string;
  };
}

interface ILastMessage {
  content: string;
  user: {
    id: string;
    username: string;
  };
}
