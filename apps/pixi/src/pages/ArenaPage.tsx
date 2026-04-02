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
// import GameNavbar from "../components/GameNavbar";
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
  const [mobileView, setMobileView] = useState(false);
  const [isUserPermission, setIsUserPermisssion] = useState({
    permission: false,
    userStream: null,
  });
  const [offerVisible, setOfferVisible] = useState(false);

  const socket = useSelector((state: RootState) => state.socket.socket);
  const isMobileView = useSelector(
    (state: RootState) => state.proximity.isMobileView,
  );

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

    socket.on("voice-call-offer", async ({ userId }) => {
      setOfferVisible(true);
      console.log(userId);
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
        // alert("want to make peer conn");
        if (isUserPermission.permission) {
          console.log("user permission gave",USER_ID);

          // await hanldeAudio(USER_ID!, isUserPermission.userStream);
        }
        // else
        //   console.log("Not permissiond")
      } catch (error) {
        console.log("Error on making peer connection" + error);
      }
    })();

    window.addEventListener("keydown", handleAudioToggle);
    window.addEventListener("keyup", handleAudioToggle);

    return () => {
      window.removeEventListener("keydown", handleAudioToggle);
      window.removeEventListener("keyup", handleAudioToggle);
    };
  }, [socket, isNearby, isUserPermission]);

  useEffect(() => {
    initSocket(dispatch, axiosAuth);
    if (isMobileView) setMobileView(true);

    return () => {
      if (socket) {
        console.log("socket disocnnetc");
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (avatarReady && pixiReady) {
      console.log("all ready");
      setAvatarLoading(true);
    }
    // console.log(useBootStore.getState().ready.AVATARS);
  }, [avatarReady, pixiReady]);

  return (
    <>
      {/* <GameNavbar /> */}
      <Box sx={{ position: "relative" }}>
        {mobileView && (
          <div
            id="joystick-zone"
            style={{
              position: "fixed",
              right: 0,
              bottom: 0,
              width: "50%",
              height: "50%",
              touchAction: "none",
              zIndex: 100,
            }}
          ></div>
        )}
        <PlanetOverlay visible={!avatarLaoding} />
        <Arena
          socket={socket}
          mobileView={mobileView}
          setIsUserPermisssion={setIsUserPermisssion}
          offerVisible={offerVisible}
          setOfferVisible={setOfferVisible}
        />
      </Box>
    </>
  );
};

export default ArenaPage;
