import { io, Socket } from "socket.io-client";
import { setSocketData } from "../redux/socket/socketSlice";

const SOCKET_API = import.meta.env.VITE_SOCKET_API_URL;
const API = import.meta.env.VITE_USER_API_URL;

export async function initSocket(dispatch: any, axiosAuth: any) {
  const { data } = await axiosAuth.post(`${API}/socket`, {
    credentials: "include",
  });
  const { token, userId, avatarId, username } = data;

  const socket: Socket = io(SOCKET_API, {
    // path: "/socket",
    transports: ["websocket"],
    auth: { token },
  });

  dispatch(
    setSocketData({
      socket,
      token,
      userId,
      avatarId,
      username,
    })
  );
}
