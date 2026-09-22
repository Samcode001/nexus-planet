import axios from "axios";
import type { CustomWebsocket } from "../types/index.js";

const handleChatMessage = async (
  data: any,
  ws: CustomWebsocket,
  conversations: Record<string, Set<CustomWebsocket>>,
) => {
  const { content, conversationId, tempMessageId } = data;

  const conversation = conversations[conversationId];

  const hasUserAcces = conversation?.has(ws);
  if (!hasUserAcces) return;

  try {
    const res = await axios.post(
      `http://localhost:3000/api/chat/${conversationId}/message`,
      {
        content,
      },
      {
        headers: {
          Authorization: `Bearer ${ws.token}`,
        },
      },
    );

    if (res.status === 201) {
      const message = res.data.newMessage;
      conversation?.forEach((client) => {
        client.send(
          JSON.stringify({
            type: "chat_message",
            payload: {
              senderId: ws.userId,
              senderUsername: ws.username,
              conversationId,
              content,
              message,
              tempMessageId,
            },
          }),
        );
        client.send(
          JSON.stringify({
            type: "conversation_update",
            payload: {
              lastMessageContent: message.content,
              conversationId,
            },
          }),
        );
      });
    }
  } catch (error) {
    console.log("Error on saving message", error);
  }
};

export default handleChatMessage;
