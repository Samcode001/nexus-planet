import type { CustomWebsocket } from "../types/index.js";

const handleMessageRequestAccept = (
  data: any,
  rooms: Record<string, Set<CustomWebsocket>>,
) => {
  const { senderId, conversation, roomId } = data;

  const room = rooms[roomId];

  // console.log("notifications pyalod", data.payload);

  room?.forEach((client) => {
    if (client.userId === senderId)
      client.send(
        JSON.stringify({
          type: "message_request_accepted",
          payload: {
            conversation,
            senderId,
          },
        }),
      );
  });
};

export default handleMessageRequestAccept;
