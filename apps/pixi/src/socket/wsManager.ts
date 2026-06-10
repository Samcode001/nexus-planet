const API = import.meta.env.VITE_USER_API_URL;

class WsManager {
  private Socket: WebSocket | null = null;

  connect() {
    this.Socket = new WebSocket("ws://localhost:8080");

    this.Socket.onopen = () => {
      console.log("webSocket COnnected");
    };

    this.Socket.onclose = () => {
      console.log("Webscoket disconnected");
    };

    this.Socket.onmessage = (event) => {
      console.log(`Socekt Message ${event}`);
    };
  }

  async join(axiosAuth: any) {
    const { data } = await axiosAuth.post(`${API}/socket`, {
      credentials: "include",
    });
    const { userId, avatarId, username } = data;
    this.sendMessage("join", {
      userId,
      username,
      avatarId,
      roomId:"1"
    });
  
  }
  sendMessage(type: any, data: any) {
    this.Socket?.send(JSON.stringify({ type, payload: data }));
  }
}

export const wsManager = new WsManager();
