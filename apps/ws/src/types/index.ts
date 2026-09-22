import type WebSocket from "ws";

export interface CustomWebsocket extends WebSocket {
  username: string;
  roomId: string;
  userId: string;
  conversations: [object];
  token: string;
}
