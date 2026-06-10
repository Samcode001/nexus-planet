import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
const app = express();

const server = http.createServer(app);

const wss = new WebSocketServer({
  server,
});

const rooms: Record<string, Set<CustomWebsocket>> = {};

wss.on("connection", (ws: CustomWebsocket) => {
  ws.on("message", (rawData) => {
    let data: any;
    try {
      data = JSON.parse(rawData.toString());
    } catch (error) {
      console.log(`Error on Parsing data in ws ${error}`);
    }
    console.log(data);
    if (data.type === "join") {
      const { roomId, username, userId } = data.payload;

      if (!roomId) return console.log("No conversation Id", data.payload);

      if (!rooms[roomId]) rooms[roomId] = new Set();

      ws.username = username;

      rooms[roomId].add(ws);
      console.log("joined called", rooms);
    }

    if (data.type === "proximity_message") {
      console.log(data.payload);
      const { roomId, targetUsername, content, userId } = data.payload;
      const proximityConversation = rooms[roomId];

      proximityConversation?.forEach((client) => {
        if (client.username === targetUsername)
          client.send(
            JSON.stringify({
              userId,
              content,
              targetUsername,
              roomId,
            }),
          );
      });
    }

    if (data.type === "move_avatar") {
      const { roomId, userId, username, x, y, direction, avatar } =
        data.payload;

      rooms[roomId]?.forEach((client) => {
        if (client.username !== ws.username) {
          client.send(
            JSON.stringify({
              roomId,
              userId,
              username,
              x,
              y,
              direction,
              avatar,
            }),
          );
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("Client Disconnected");
  });
});

server.listen(8080, () => {
  console.log("ws Server running on port 8080");
});

interface CustomWebsocket extends WebSocket {
  username: string;
}
