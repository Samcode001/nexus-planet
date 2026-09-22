import type { CustomWebsocket } from "../types/index.js";

const handleAvatarMove = async (
  data: any,
  ws: CustomWebsocket,
  rooms: Record<string, Set<CustomWebsocket>>,
) => {
  const { roomId, userId, username, x, y, direction, avatar } = data;

  rooms[roomId]?.forEach((client) => {
    if (client.username !== ws.username) {
      client.send(
        JSON.stringify({
          type: "other_avatar_move",
          payload: {
            roomId,
            userId,
            username,
            x,
            y,
            direction,
            avatar,
          },
        }),
      );
    }
  });
};

export default handleAvatarMove;
