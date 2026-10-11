import { useRef } from "react";
import { wsManager } from "../socket/wsManager";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

const servers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const usePeerConnection = (
  pcRef: React.RefObject<RTCPeerConnection | null>,
  remoteAudioElement: React.RefObject<HTMLAudioElement | null>,
) => {
  // const micTrackRef = useRef<MediaStreamTrack | null>(null);
  // const audioInitializeRef = useRef<boolean>(false);
  // const audioSenderRef = useRef<RTCRtpSender | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const iceCandidates = useRef<RTCIceCandidate[]>([]);

  const userData = useSelector((state: RootState) => state.user);

  const initMic = async (providedStream?: MediaStream) => {
    // already initialized
    // if (micTrackRef.current) return;

    let stream: MediaStream;

    if (providedStream) {
      stream = providedStream;
    } else {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }

    // const track = stream.getAudioTracks()[0];

    // runtime safety guard
    // if (!track) {
    //   throw new Error("No audio track available in MediaStream");
    // }

    localStream.current = stream;
    // micTrackRef.current = track;

    // TS-safe (track is guaranteed non-null here)
    // track.enabled = false;
  };

  const getPeerConnection = async (peerId: string, conversationId: string) => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection(servers); // create webRTC pipe

    //"register this media source with connection" or add the stream to the pipe
    localStream.current?.getTracks().forEach((track) => {
      if (!localStream.current) return;
      pc.addTrack(track, localStream.current);
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        // console.log("Local Ice Candidate", {
        //   type: e.candidate.type,
        //   protocol: e.candidate.protocol,
        //   address: e.candidate.address,
        //   port: e.candidate.port,
        //   candidate: e.candidate.candidate,
        // });

        wsManager.sendMessage({
          type: "voice_ice",
          payload: {
            candidate: e.candidate,
            recieverId: peerId,
            conversationId,
          },
        });
      } else console.log("ICE Gathering Complete");
      // socket.emit("voice-ice", { candidate: e.candidate, userId });
    };

    // audioSenderRef.current = pc.addTrack(
    //   micTrackRef.current!,
    //   localStream.current!,
    // ); // add the stream to the pipe

    pc.ontrack = (e) => {
      // play incoming audio
      try {
        if (!remoteAudioElement.current) return;
        remoteAudioElement.current.srcObject = e.streams[0];

        remoteAudioElement.current
          .play()
          .catch((error) => console.log("Error on playing audio", error));
        // const audio = document.createElement("audio");
        // audio.srcObject = e.streams[0];
        // audio.autoplay = true;
      } catch (error) {
        console.log("Erro on playin incomig Audio", error);
      }
    };

    pcRef.current = pc;

    pcRef.current.onconnectionstatechange = () => {
      console.log("connection state", pcRef.current?.connectionState);
    };

    pcRef.current.oniceconnectionstatechange = () => {
      console.log("ice", pcRef.current?.iceConnectionState);
    };

    pcRef.current.onsignalingstatechange = () => {
      console.log("signalling", pcRef.current?.signalingState);
    };

    return pc;
  };

  const startCall = async (userStream: any) => {
    // this si sending offer (sending audio over webrtc pipline via help of socket signaling)

    await initMic(userStream);
    if (!localStream.current) return;
    // socket.emit("voice-call-offer", { userId });
    const pc = await getPeerConnection(
      userData.selectedUser?.userId!,
      userData.selectedUser?.conversationId!,
    );
    if (!pc) return;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    console.log("offer created ");
    // socket.emit("voice-offer", { offer, userId });
    wsManager.sendMessage({
      type: "voice_offer",
      payload: {
        offer,
        recieverId: userData.selectedUser?.userId!,
        conversationId: userData.selectedUser?.conversationId!,
      },
    });

    wsManager.sendMessage({
      type: "voice_offer_recieved",
      payload: {
        recieverId: userData.selectedUser?.userId!,
        conversationId: userData.selectedUser?.conversationId!,
      },
    });
  };

  const handleIncomingCall = async (
    conversationId: string,
    senderId: string,
    offer: RTCSessionDescriptionInit,
  ) => {
    // if (!socket) return;
    // if (pcRef.current) pcRef.current.close();
    await initMic();
    console.log("offer recived");
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
    if (!localStream.current) return;
    const pc = await getPeerConnection(senderId, conversationId);
    if (!pc) return;
    await pc.setRemoteDescription(offer);

    //forEach() doesn't understand/await the promises returned by an async callback.
    // iceCandidates.current.forEach(async (candidate) => {
    //   await pc.addIceCandidate(candidate);
    // });

    for (const candidate of iceCandidates.current) {
      await pc.addIceCandidate(candidate);
    }

    iceCandidates.current = [];

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    // socket.emit("voice-answer", { answer, userId });
    wsManager.sendMessage({
      type: "voice_answer",
      payload: {
        answer,
        senderId,
        conversationId,
      },
    });
  };

  const handleCandidate = async (data: { candidate: RTCIceCandidate }) => {
    if (!pcRef.current) return;
    if (pcRef.current.remoteDescription)
      await pcRef.current.addIceCandidate(data.candidate);
    else iceCandidates.current.push(data.candidate);
  };

  const handleVoiceAnswer = async (data: {
    answer: RTCSessionDescriptionInit;
  }) => {
    try {
      console.log("answer started", pcRef.current?.signalingState);

      await pcRef.current?.setRemoteDescription(data.answer);
      console.log("remote description set", pcRef.current?.signalingState);

      // iceCandidates.current.forEach(async (candidate) => {
      //   await pcRef.current?.addIceCandidate(candidate);
      //   console.log("candidates added", pcRef.current?.signalingState);
      // });

      // An ICE candidate isn't useful in isolation. It belongs to a particular WebRTC negotiation/session described by the remote description.
      for (const candidate of iceCandidates.current)
        await pcRef.current?.addIceCandidate(candidate);

      iceCandidates.current = [];
    } catch (error) {
      console.log("Error on answering ", error);
    }
  };

  // const handleAudioToggle = (e: KeyboardEvent) => {
  //   const isTyping =
  //     document.activeElement instanceof HTMLInputElement ||
  //     document.activeElement instanceof HTMLTextAreaElement ||
  //     document.activeElement?.getAttribute("contenteditable") === "true"; // done this beacuse dont wnat to close the audio stream when you pree "s"
  //   if (isTyping) return;
  //   if (e.code === "Space") {
  //     if (e.type === "keydown") {
  //       // console.log("keydown");
  //       startTalking();
  //       // if (audioInitializeRef.current) return;
  //       // hanldeAudio();
  //       // audioInitializeRef.current = true;
  //     }
  //     if (e.type === "keyup") {
  //       // console.log("keyup");
  //       stopTalking();
  //     }
  //   }
  // };

  // const startTalking = async () => {
  //   if (micTrackRef.current) {
  //     micTrackRef.current.enabled = true;
  //     //   console.log("mic on");
  //   }
  // };

  // const stopTalking = async () => {
  //   if (micTrackRef.current) {
  //     micTrackRef.current.enabled = false;
  //     // await audioSenderRef.current.replaceTrack(null);
  //     //   console.log("mic off");
  //   }
  // };

  return {
    // handleAudioToggle,
    handleIncomingCall,
    startCall,
    handleCandidate,
    handleVoiceAnswer,
  };
};

export default usePeerConnection;
