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
// import { Box } from "@mui/material";
import PlanetOverlay from "./ArenaOverlay";
import usePeerConnection from "../hook/usePeerConnection";
import { wsManager } from "../socket/wsManager";
// import ConversationBar from "../components/ConversationBar";
import GameNavbar from "../components/GameNavbar";
import type { IncomingCallData } from "../types/common";

// const API = import.meta.env.VITE_USER_API_URL;
// const SOCKET_API = import.meta.env.VITE_SOCKET_API_URL;

const ArenaPage = () => {
  const axiosAuth = useAxiosAuth();
  const dispatch = useAppDispatch();
  // const isNearby = useSelector((state: RootState) => state.proximity.isNearby);

  const [avatarLaoding, setAvatarLoading] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [_, setIsUserPermisssion] = useState({
    userId: null,
    permission: false,
    userStream: null,
  });
  const [incomingCallData, setIncomingCallData] = useState<IncomingCallData>({
    conversationId: "",
    senderId: "",
    offer: null,
    showNotification: false,
  });
  const [conversationBarVisible, setConversationBarVisible] =
    useState<boolean>(false);

  const socket = useSelector((state: RootState) => state.socket.socket);
  const isMobileView = useSelector(
    (state: RootState) => state.proximity.isMobileView,
  );
  const userData = useSelector((state: RootState) => state.user);

  const avatarReady = useBootStore((state) => state.ready.AVATARS);
  const pixiReady = useBootStore((state) => state.ready.PIXI);

  const pcRef = useRef<RTCPeerConnection>(null);
  const remoteAudioElement = useRef<HTMLAudioElement | null>(null);

  const { startCall, handleIncomingCall, handleCandidate, handleVoiceAnswer } =
    usePeerConnection(pcRef, remoteAudioElement);

  useEffect(() => {
    // handlng incoming offer or incoming audio
    // if (!socket) return;

    // const handleVoiceAnswer = async (data: { answer: any; userId: any }) => {
    //   const pc = pcRef.current;
    //   if (!pc) return;
    //   await pc.setRemoteDescription(data.answer);
    // };

    // const handleCandidate = async (data: {
    //   candidate: any;
    //   userId: string;
    // }) => {
    //   const pc = pcRef.current;
    //   if (!pc) return;
    //   await pc.addIceCandidate(data.candidate);
    // };

    // const handleVoiceofferRecieved = (data: { recieverId: string }) => {
    //   setIncomingCallData((prev) => ({ ...prev, showNotification: true }));
    //   console.log(data.recieverId);
    // };

    const storeIncomingCallData = (data: {
      conversationId: string;
      offer: any;
      senderId: string;
    }) => {
      setIncomingCallData({
        conversationId: data.conversationId,
        senderId: data.senderId,
        offer: data.offer,
        showNotification: true,
      });
    };

    wsManager.subscribe("voice_offer", storeIncomingCallData);
    wsManager.subscribe("voice_answer", handleVoiceAnswer);
    wsManager.subscribe("voice_ice", handleCandidate);
    // wsManager.subscribe("voice_offer_recieved", handleVoiceofferRecieved);

    // socket.on("voice-offer", handleIncomingAudio);
    // socket.on("voice-answer", async ({ answer, userId }) => {
    //   const pc = pcRef.current[userId];
    //   if (!pc) return;
    //   await pc.setRemoteDescription(answer);
    // });

    // socket.on("voice-ice", async ({ candidate, userId }) => {
    //   const pc = pcRef.current[userId];
    //   await pc.addIceCandidate(candidate);
    // });

    // socket.on("voice-call-offer", async ({ userId }) => {
    //   setOfferVisible(true);
    //   console.log(userId);
    // });

    return () => {
      wsManager.unsubscribe("voice_offer", storeIncomingCallData);
      wsManager.unsubscribe("voice_answer", handleVoiceAnswer);
      wsManager.unsubscribe("voice_ice", handleCandidate);
      // wsManager.unsubscribe("voice_offer_recieved", handleVoiceofferRecieved);
      // if (pcRef.current[USER_ID!]) pcRef.current[USER_ID!].close();
    };
  }, []);

  // useEffect(() => {
  //   if (!isNearby) return;

  //   (async () => {
  //     try {
  //       // alert("want to make peer conn");
  //       if (isUserPermission.permission) {
  //         console.log("user permission gave");

  //         await startCall(isUserPermission.userStream);
  //       }
  //       // else
  //       //   console.log("Not permissiond")
  //     } catch (error) {
  //       console.log("Error on making peer connection" + error);
  //     }
  //   })();

  //   // window.addEventListener("keydown", handleAudioToggle);
  //   // window.addEventListener("keyup", handleAudioToggle);

  //   return () => {
  //     // window.removeEventListener("keydown", handleAudioToggle);
  //     // window.removeEventListener("keyup", handleAudioToggle);
  //   };
  // }, [socket, isNearby, isUserPermission]);

  useEffect(() => {
    // initSocket(dispatch, axiosAuth);
    wsManager.connect(dispatch, axiosAuth, userData.token!);

    if (isMobileView) setMobileView(true);
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
      <GameNavbar setConversationBarVisible={setConversationBarVisible} />

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
        incomingCallData={incomingCallData}
        setIncomingCallData={setIncomingCallData}
        conversationBarVisible={conversationBarVisible}
        handleIncomingCall={handleIncomingCall}
        startCall={startCall}
      />
      <audio autoPlay ref={remoteAudioElement}></audio>
    </>
  );
};

export default ArenaPage;
