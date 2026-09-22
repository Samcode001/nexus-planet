import axios from "axios";
import type { CustomWebsocket } from "../types/index.js";

const handleProximityMessage = async (
  data: any,
  ws: CustomWebsocket,
  rooms: Record<string, Set<CustomWebsocket>>,
) => {
  // console.log(data.payload);
  const { roomId, receiverId, content, conversationId } = data;
  const proximityConversation = rooms[roomId];
  // console.log("prxoimity payload", data.payload);
  let isNotification = false;
  if (!conversationId) isNotification = true;
  try {
    const res = await axios.post(
      "http://localhost:3000/api/chat/message-request",
      {
        content,
        receiverId,
      },
      {
        headers: {
          Authorization: `Bearer ${ws.token}`,
        },
      },
    );

    proximityConversation?.forEach((client) => {
      if (client.userId === receiverId)
        client.send(
          JSON.stringify({
            type: "proximity_message",
            payload: {
              messageRequestId: res.data.messageRequest.id,
              senderId: ws.userId,
              senderUsername: ws.username,
              content,
              receiverId,
              roomId,
              isNotification,
              conversationId,
            },
          }),
        );
    });
  } catch (error) {
    console.log("Error in sending message Request in proximity chat", error);
  }
};

export default handleProximityMessage;
