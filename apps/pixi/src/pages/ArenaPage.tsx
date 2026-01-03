// import React from "react";
import { useEffect, useRef, useState } from "react";
// import { useAxiosAuth } from "../api/axiosClient";
import Arena from "../components/Arena";
// import { io, type Socket } from "socket.io-client";
// import { socket } from "../redux/socket/socket";
import { useAppDispatch } from "../redux/hook";
import { useAxiosAuth } from "../api/axiosClient";
// import { io } from "socket.io-client";
// import { setSocketData } from "../redux/socket/socketSlice";
import type { RootState } from "../redux/store";
import { useSelector } from "react-redux";
import GameNavbar from "../components/GameNavbar";
import { useBootStore } from "../store/bootstore";
import { Box } from "@mui/material";
import PlanetOverlay from "./ArenaOverlay";
import { initSocket } from "../socket/socketManager";
import usePeerConnection from "../hook/usePeerConnection";

// const API = import.meta.env.VITE_USER_API_URL;
// const SOCKET_API = import.meta.env.VITE_SOCKET_API_URL;

const ArenaPage = () => {
  const axiosAuth = useAxiosAuth();
  const dispatch = useAppDispatch();
  const isNearby = useSelector((state: RootState) => state.proximity.isNearby);
  const USER_ID = useSelector((state: RootState) => state.socket.userId);

  const [avatarLaoding, setAvatarLoading] = useState(false);
  const socket = useSelector((state: RootState) => state.socket.socket);

  const avatarReady = useBootStore((state) => state.ready.AVATARS);
  const pixiReady = useBootStore((state) => state.ready.PIXI);

  const pcRef = useRef<Record<string, RTCPeerConnection>>({});

  const { handleAudioToggle, handleIncomingAudio, hanldeAudio } =
    usePeerConnection(socket!, pcRef);

  useEffect(() => {
    // handlng incoming offer or incoming audio
    if (!socket) return;

    socket.on("voice-offer", handleIncomingAudio);
    socket.on("voice-answer", async ({ answer, userId }) => {
      const pc = pcRef.current[userId];
      if (!pc) return;
      await pc.setRemoteDescription(answer);
    });

    socket.on("voice-ice", async ({ candidate, userId }) => {
      const pc = pcRef.current[userId];
      await pc.addIceCandidate(candidate);
    });

    return () => {
      socket.off("voice-offer");
      socket.off("voice-answer");
      socket.off("voice-ice");
      if (pcRef.current[USER_ID!]) pcRef.current[USER_ID!].close();
    };
  }, [socket]);

  useEffect(() => {
    if (!isNearby) return;

    (async () => {
      try {
        await hanldeAudio(USER_ID!);
      } catch (error) {
        console.log("Error on making peer connection");
      }
    })();

    window.addEventListener("keydown", handleAudioToggle);
    window.addEventListener("keyup", handleAudioToggle);

    return () => {
      window.removeEventListener("keydown", handleAudioToggle);
      window.removeEventListener("keyup", handleAudioToggle);
    };
  }, [socket, isNearby]);

  useEffect(() => {
    initSocket(dispatch, axiosAuth);

    return () => {
      if (socket) {
        console.log("socket disocnnetc");
        socket.disconnect();
      }
    };
  }, []);
  // useEffect(() => {
  //   async function initSocket() {
  //     const res = await axiosAuth.post(`${API}/socket`, {
  //       credentials: "include",
  //     });

  //     const { token, userId, avatarId, username } = res.data;

  //     const socket = io(SOCKET_API, {
  //       // path: "/socket",
  //       transports: ["websocket"],
  //       auth: { token },
  //     });

  //     dispatch(
  //       setSocketData({
  //         socket,
  //         token,
  //         userId,
  //         avatarId,
  //         username,
  //       })
  //     );
  //   }

  //   // if (!socket) return;
  //   initSocket();
  //   return () => {
  //     if (socket) {
  //       console.log("socket disconnect")
  //       socket.disconnect();
  //       // dispatch(setSocketData(null));
  //     }
  //   };
  // }, []);

  useEffect(() => {
    if (avatarReady && pixiReady) {
      console.log("all ready");
      setAvatarLoading(true);
    }
    // console.log(useBootStore.getState().ready.AVATARS);
  }, [avatarReady, pixiReady]);

  return (
    <>
      <GameNavbar />
      <Box>
        <PlanetOverlay visible={!avatarLaoding} />
        <Arena socket={socket} />
      </Box>
    </>
  );
};

export default ArenaPage;
