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

  sendMessage(data: any) {
    this.Socket?.send(JSON.stringify(data));
  }
}

export const wsManager = new WsManager();
