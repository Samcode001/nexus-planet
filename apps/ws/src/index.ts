import axios from "axios";
import express, { type Request } from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import type { CustomWebsocket } from "./types/index.js";
import handleChatMessage from "./handlers/chatMessage.handler.js";
import handleProximityMessage from "./handlers/proximityMessage.handler.js";
import handleAvatarMove from "./handlers/moveAvatar.handler.js";
import handleJoinConversation from "./handlers/joinConversation.hanldler.js";
import handleJoinRoom from "./handlers/joinRoom.handler.js";
import handleMessageRequestAccept from "./handlers/messageRequestAccept.handler.js";
import handleTyping from "./handlers/typing.handler.js";
const app = express();

const server = http.createServer(app);

const wss = new WebSocketServer({
  server,
});

const rooms: Record<string, Set<CustomWebsocket>> = {};
const conversations: Record<string, Set<CustomWebsocket>> = {};

wss.on("connection", async (ws: CustomWebsocket, req: Request) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get("token");

  try {
    const { data: userData } = await axios.get(
      "http://localhost:3000/api/user",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!userData) return console.log("Error on loading user data");

    ws.userId = userData.userId;
    ws.username = userData.username;
    ws.token = token!;

    // const { data: conversationData } = await axios.get(
    //   "http://localhost:3000/api/chat/conversation",
    //   {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //     },
    //   },
    // );
    // if (!conversationData) return console.log("Error on loading conversations");
    // ws.conversations = conversationData.conversations;
    // console.log("conversations", data.conversations);
  } catch (error) {
    console.log("error on loading user", error);
  }

  ws.on("message", async (rawData) => {
    let data: any;
    try {
      data = JSON.parse(rawData.toString());
    } catch (error) {
      console.log(`Error on Parsing data in ws ${error}`);
    }
    // console.log(data);
    if (data.type === "join_room") {
      handleJoinRoom(data.payload, ws, rooms);
      // console.log("joined called", ws.username, rooms[roomId]);
    }

    if (data.type === "join_conversation") {
      handleJoinConversation(data.payload, ws, conversations);
    }

    if (data.type === "message_request_accepted") {
      handleMessageRequestAccept(data.payload, rooms);
    }

    if (data.type === "chat_message") {
      handleChatMessage(data.payload, ws, conversations);
    }

    if (data.type === "proximity_message") {
      handleProximityMessage(data.payload, ws, rooms);
    }

    if (data.type === "move_avatar") {
      handleAvatarMove(data.payload, ws, rooms);
    }

    if (data.type === "isTyping") {
      handleTyping(data.payload, ws, conversations);
    }

    if (data.type === "ping") {
      ws.send(
        JSON.stringify({
          type: "pong",
        }),
      );
    }
  });

  ws.on("close", () => {
    console.log("Client Disconnected");
    const { roomId, userId } = ws;
    rooms[roomId]?.forEach((client) => {
      client.send(
        JSON.stringify({
          type: "user_disconnect",
          payload: {
            userId,
          },
        }),
      );
    });
  });
});

server.listen(8080, () => {
  console.log("ws Server running on port 8080");
});
