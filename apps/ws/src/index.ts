import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
const app = express();

const server = http.createServer(app);

const wss = new WebSocketServer({
  server,
});

wss.on("connection", (ws) => {
  ws.on("message", (rawData) => {
    let data;
    try {
      data = JSON.parse(rawData.toString());
    } catch (error) {
      console.log(`Error on Parsing data in ws ${error}`);
    }
    console.log(data);
    // if (data.type === "message") {
    //   console.log(data.payload);
    // }
  });

  ws.on("close", () => {
    console.log("Client Disconnected");
  });
});

server.listen(8080, () => {
  console.log("ws Server running on port 8080");
});
