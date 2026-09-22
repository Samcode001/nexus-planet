import type { CustomWebsocket } from "../types/index.js";

const handleJoinRoom = (
  data: any,
  ws: CustomWebsocket,
  rooms: Record<string, Set<CustomWebsocket>>,
) => {
  const { roomId } = data;

  if (!roomId) return console.log("No conversation Id", data.payload);

  if (!rooms[roomId]) rooms[roomId] = new Set();

  ws.roomId = roomId;

  rooms[roomId].add(ws);
};

export default handleJoinRoom;
