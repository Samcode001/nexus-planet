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

// const API = import.meta.env.VITE_USER_API_URL;
// const SOCKET_API = import.meta.env.VITE_SOCKET_API_URL;

const ArenaPage = () => {
  const axiosAuth = useAxiosAuth();
  const dispatch = useAppDispatch();
  const isNearby = useSelector((state: RootState) => state.proximity.isNearby);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const micTrackRef = useRef<MediaStreamTrack | null>(null);
  const audioInitializeRef = useRef<boolean>(false);
  const audioSenderRef = useRef<RTCRtpSender | null>(null);

  const [avatarLaoding, setAvatarLoading] = useState(false);
  const socket = useSelector((state: RootState) => state.socket.socket);

  const avatarReady = useBootStore((state) => state.ready.AVATARS);
  const pixiReady = useBootStore((state) => state.ready.PIXI);

  const hanldeAudio = async () => {
    // this si sending offer (sending audio over webrtc pipline via help of socket signaling)
    if (!socket) return;
    if (pcRef.current) pcRef.current.close();
    const stream = await navigator.mediaDevices.getUserMedia({
      // gets the acces from the user browser
      audio: true,
    });

    micTrackRef.current = stream.getAudioTracks()[0]; // add the stream to the pipe

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    }); // create webRTC pipe
    pcRef.current = pc;

    audioSenderRef.current = pc.addTrack(micTrackRef.current, stream); // add the stream to the pipe

    pc.ontrack = (e) => {
      // play incoming audio
      const audio = document.createElement("audio");
      audio.srcObject = e.streams[0];
      audio.autoplay = true;
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit("voice-ice", e.candidate);
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("voice-offer", offer);
  };

  const handleIncomingAudio = async (offer: any) => {
    if (!socket) return;
    if (pcRef.current) pcRef.current.close();
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    pc.ontrack = (e) => {
      const audio = document.createElement("audio");
      audio.srcObject = e.streams[0];
      audio.autoplay = true;
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit("voice-ice", e.candidate);
    };

    await pc.setRemoteDescription(offer);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("voice-answer", answer);
  };

  useEffect(() => {
    // handlng incoming offer or incoming audio
    if (!socket) return;

    socket.on("voice-offer", handleIncomingAudio);
    socket.on("voice-answer", async (answer) => {
      await pcRef.current?.setRemoteDescription(answer);
    });

    socket.on("voice-ice", async (candidate) => {
      await pcRef.current?.addIceCandidate(candidate);
    });

    return () => {
      socket.off("voice-offer");
      socket.off("voice-answer");
      socket.off("voice-ice");
      if (pcRef.current) pcRef.current.close();
    };
  }, [socket]);

  const handleAudioToggle = (e: KeyboardEvent) => {
    const isTyping =
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement ||
      document.activeElement?.getAttribute("contenteditable") === "true"; // done this beacuse dont wnat to close the audio stream when you pree "s"
    if (isTyping) return;
    if (e.key === "s" || e.key === "S") {
      if (e.type === "keydown") {
        console.log("keydown");
        startTalking();
        if (audioInitializeRef.current) return;
        hanldeAudio();
        audioInitializeRef.current = true;
      }
      if (e.type === "keyup") {
        console.log("keyup");
        stopTalking();
      }
    }
  };

  const startTalking = async () => {
    if (micTrackRef.current && audioSenderRef.current) {
      await audioSenderRef.current.replaceTrack(micTrackRef.current);
      // micTrackRef.current.enabled = true;
      console.log("mic on");
    }
  };

  const stopTalking = async () => {
    if (audioSenderRef.current) {
      // micTrackRef.current.enabled = false;
      await audioSenderRef.current.replaceTrack(null);
      console.log("mic off");
    }
  };
  useEffect(() => {
    if (!isNearby) return;

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
