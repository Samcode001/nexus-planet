// import { createContext, type ReactNode } from "react";
// import { useAxiosAuth } from "../api/axiosClient";
// import { initSocket } from "./socketManager";
// import { useAppDispatch } from "../redux/hook";

// const API = import.meta.env.VITE_USER_API_URL;
// const SocketContext = createContext(null);

// export const SocketProvider = async ({ children }: { children: ReactNode }) => {
//   const axiosAuth = useAxiosAuth();
//   const dispatch = useAppDispatch();

//   const { data } = await axiosAuth.post(`${API}/socket`);

//   initSocket(data, dispatch);

//   return (
//     <SocketContext.Provider value={null}>{children}</SocketContext.Provider>
//   );
// };
