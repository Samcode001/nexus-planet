import { useRef } from "react";
import type { Socket } from "socket.io-client";

const usePeerConnection = (socket: Socket,pcRef: any) => {
  const micTrackRef = useRef<MediaStreamTrack | null>(null);
  // const audioInitializeRef = useRef<boolean>(false);
  const audioSenderRef = useRef<RTCRtpSender | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const initMic = async () => {
    if (micTrackRef.current) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      // gets the acces from the user browser
      audio: true,
    });
    streamRef.current = stream;
    micTrackRef.current = stream.getAudioTracks()[0]; // add stream tot he pipe
    micTrackRef.current.enabled = false;
  };

  const getPeerConnection = async (userId: string) => {
    if (!socket) return;
    if (pcRef.current[userId]) return pcRef.current[userId];
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    }); // create webRTC pipe

    audioSenderRef.current = pc.addTrack(
      micTrackRef.current!,
      streamRef.current!
    ); // add the stream to the pipe

    pc.ontrack = (e) => {
      // play incoming audio
      const audio = document.createElement("audio");
      audio.srcObject = e.streams[0];
      audio.autoplay = true;
    };

    pc.onicecandidate = (e) => {
      if (e.candidate)
        socket.emit("voice-ice", { candidate: e.candidate, userId });
    };
    pcRef.current[userId] = pc;
    return pc;
  };

  const hanldeAudio = async (userId: string) => {
    // this si sending offer (sending audio over webrtc pipline via help of socket signaling)
    if (!socket) return;
    if (!micTrackRef.current) await initMic();
    const pc = await getPeerConnection(userId);
    if (!pc) return;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("voice-offer", { offer, userId });
  };

  const handleIncomingAudio = async ({ offer, userId }: any) => {
    if (!socket) return;
    // if (pcRef.current) pcRef.current.close();
     console.log("offered")
    if (!micTrackRef.current) await initMic();
    // const pc = new RTCPeerConnection({
    //   iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    // });
    // pcRef.current = pc;

    // pc.ontrack = (e) => {
    //   const audio = document.createElement("audio");
    //   audio.srcObject = e.streams[0];
    //   audio.autoplay = true;
    // };

    // pc.onicecandidate = (e) => {
    //   if (e.candidate) socket.emit("voice-ice", e.candidate);
    // };

    // pc.addTrack(micTrackRef.current!, streamRef.current!);

    const pc = await getPeerConnection(userId);
    if (!pc) return;
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("voice-answer", { answer, userId });
  };

  const handleAudioToggle = (e: KeyboardEvent) => {
    const isTyping =
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement ||
      document.activeElement?.getAttribute("contenteditable") === "true"; // done this beacuse dont wnat to close the audio stream when you pree "s"
    if (isTyping) return;
    if (e.code === "Space") {
      if (e.type === "keydown") {
        // console.log("keydown");
        startTalking();
        // if (audioInitializeRef.current) return;
        // hanldeAudio();
        // audioInitializeRef.current = true;
      }
      if (e.type === "keyup") {
        // console.log("keyup");
        stopTalking();
      }
    }
  };

  const startTalking = async () => {
    if (micTrackRef.current) {
      micTrackRef.current.enabled = true;
    //   console.log("mic on");
    }
  };

  const stopTalking = async () => {
    if (micTrackRef.current) {
      micTrackRef.current.enabled = false;
      // await audioSenderRef.current.replaceTrack(null);
    //   console.log("mic off");
    }
  };

  return {
    handleAudioToggle,
    handleIncomingAudio,
    hanldeAudio,
  };
};

export default usePeerConnection;
