import type { AxiosInstance } from "axios";
import { setSocketData } from "../redux/socket/socketSlice";
import type { AppDispatch } from "../redux/store";
import { setUserData } from "../redux/user/userSlice";
// import type { IConversation } from "../types/common";
import type { SendMessage } from "@repo/types";

const API = import.meta.env.VITE_USER_API_URL;

class WsManager {
  private socket: WebSocket | null = null;
  public userId: string | null = null;
  public username: string | null = null;
  public avatarId: string | null = null;
  public conversationIds: string[] = [];
  private heartBeatInterval: number | null = null;
  private pongTimeout: number | null = null;
  private reconnectCalls: number = 1;
  private reconnectTimer: number | null = null;

  private subscriptionMap = new Map<string, Set<Function>>();

  async connect(
    dispatch: AppDispatch,
    axiosAuth: AxiosInstance,
    token: string,
  ) {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    )
      return this.socket;

    this.socket = new WebSocket(`ws://localhost:8080?token=${token}`);

    this.socket.onopen = async () => {
      const { data } = await axiosAuth.get(`${API}/user`);
      const { userId, avatarId, username } = data;

      dispatch(
        setSocketData({
          socket: this.socket,
        }),
      );

      dispatch(
        setUserData({
          userId,
          username,
          avatarId,
        }),
      );

      this.userId = userId;
      this.username = username;
      this.avatarId = avatarId;

      this.joinRoom();
      this.joinConversations();
      console.log("websocket Connected");
      this.startHeartBeat();
      this.reconnectCalls = 1;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      // if (this.reconnectInterval) clearInterval(this.reconnectInterval);
    };

    this.socket.onclose = () => {
      console.log("Webscoket disconnected");

      if (this.heartBeatInterval) {
        clearInterval(this.heartBeatInterval);
        this.heartBeatInterval = null;
      }
      if (this.pongTimeout) clearTimeout(this.pongTimeout);

      this.reconnectTimer = window.setTimeout(() => {
        if (this.reconnectCalls > 10) return;

        console.log("Reconnecting...");
        this.connect(dispatch, axiosAuth, token);
      }, this.reconnectCalls * 1000);
      this.reconnectCalls = this.reconnectCalls * 2;
    };

    this.socket.onerror = (error) => {
      console.log("Error Occured in socket", error);
    };

    this.socket.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      const { type, payload } = data;
      // console.log(`Socekt Message `, data);
      if (type === "pong") {
        if (this.pongTimeout) clearTimeout(this.pongTimeout);
        return;
      }

      const listener = this.subscriptionMap.get(type);
      listener?.forEach((callback) => callback(payload));
    };
  }

  startHeartBeat() {
    if (this.heartBeatInterval) {
      clearInterval(this.heartBeatInterval);
      this.heartBeatInterval = null;
    }
    // doing windiw here because typescirpt mismatch happens between global.settimeout or window.setTImeout
    this.heartBeatInterval = window.setInterval(() => {
      this.socket?.send(
        JSON.stringify({
          type: "ping",
          payload: {},
        }),
      );

      this.pongTimeout = window.setTimeout(() => {
        this.socket?.close();
      }, 12000);
    }, 25000);
  }

  async joinRoom() {
    this.sendMessage({
      type: "join_room",
      payload: {
        roomId: "1",
      },
    });
  }

  joinConversations() {
    if (this.conversationIds.length > 0)
      this.conversationIds.forEach((id) => {
        this.sendMessage({
          type: "join_conversation",
          payload: {
            conversationId: id,
          },
        });
      });
  }

  setConversations(conversationIds: string[]) {
    this.conversationIds = conversationIds;
    this.joinConversations();
  }

  sendMessage(data: SendMessage) {
    this.socket?.send(
      JSON.stringify({ type: data.type, payload: data.payload }),
    );
  }

  subscribe(type: any, callback: any) {
    if (!this.subscriptionMap.has(type))
      this.subscriptionMap.set(type, new Set());
    const listener = this.subscriptionMap.get(type);
    // if (!listener) return;
    listener?.add(callback);
  }

  unsubscribe(type: any, callback: any) {
    const listener = this.subscriptionMap.get(type);
    listener?.delete(callback);
  }
}

export const wsManager = new WsManager();
