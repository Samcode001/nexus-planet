import { Stage } from "@pixi/react";
import useDimensions from "../hook/useDimensions";
import { useEffect, useRef, useState } from "react";
// import { io, type Socket } from "socket.io-client";
import { useAxiosAuth } from "../api/axiosClient";
import MainContainer from "./MainContainer";
import { Box, Container } from "@mui/material";
import ChatInput from "./ChatInput";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { useAppDispatch } from "../redux/hook";
import type { Direction, selectedAvatar } from "../types/common";
import { setJoyDirection } from "../redux/Proximity/proximitySlice";
import useJoyStick from "../hook/useJoyStick";
import AvatarVoicePrompt from "./AvatarVoicePrompt";
import IncomingCallPopup from "./IncomigCallPopup";

interface IAvatar {
  id: string;
  x: number;
  y: number;
  direction: Direction;
  avatar: string;
  username: string;
}

const Arena = ({
  socket,
  mobileView,
  setIsUserPermisssion,
  offerVisible,
  setOfferVisible,
}: any) => {
  const isNearby = useSelector((state: RootState) => state.proximity.isNearby);
  const canvasSize = useDimensions();
  const [userSprite, setUserSprite] = useState<string>("/avatars/hero.png");
  const [userChat, setUserchat] = useState("");
  const [userChatVisible, setUserchatVisible] = useState(false);
  const [usersAvatars, setUsersAvatars] = useState<IAvatar[]>([]);
  const [nearbyPlayers, setNearbyPlayers] = useState<string[]>([]);
  const [screenPos, setScreenPos] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [selectedOtherUserAvatar, setSelectedOtherUserAvatar] =
    useState<selectedAvatar>(null);
  const [multiplePopupsVisible, setMultiplePopupsVisible] = useState<
    Record<string, boolean>
  >({});

  const onScreenPos = useRef<Record<string, { x: number; y: number }>>({});
  // const multiplePopupsVisibleRef = useRef<boolean>(false);
  const dispatch = useAppDispatch();
  const socketAvatarId = useSelector(
    (state: RootState) => state.socket.avatarId,
  )!;
  const socketUserId = useSelector((state: RootState) => state.socket.userId)!;
  const socketUsername = useSelector(
    (state: RootState) => state.socket.username,
  )!;
  const axiosAuth = useAxiosAuth();

  // console.log(socketToken, socketUserId);

  const getuserAvatar = async () => {
    const res = await axiosAuth.get("/avatar");
    if (res.status === 200 && res.data.avatarId) {
      let avatar = `/avatars/${res.data.avatarId}.png`;
      setUserSprite(avatar);
    }
  };

  const getOtherUserPostions = () => {
    // let otherUser = usersAvatars[0];
    // xRef.current = otherUser.x;
    // yRef.current = otherUser.y;
    // console.log(usersAvatars);
  };

  // const hanldePosChange = (avatar: IAvatar) => {
  //   multiplePopupsVisibleRef.current =
  //     selectedOtherUserAvatar?.username === avatar.username && isNearby;
  // };
  // const { socket, socketUserId, socketAvatarId } = Socket();
  useEffect(() => {
    getuserAvatar();
    let raf: number;
    let last = 0;

    const loop = (t: number) => {
      if (t - last > 33) {
        // ~30fps
        setScreenPos((prev) => {
          const next = onScreenPos.current;

          // prevent useless renders
          for (const k in next) {
            if (
              !prev[k] ||
              prev[k].x !== next[k].x ||
              prev[k].y !== next[k].y
            ) {
              return { ...next };
            }
          }
          return prev;
        });
        last = t;
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    console.log(selectedOtherUserAvatar);
  }, [selectedOtherUserAvatar]);

  useEffect(() => {
    if (usersAvatars.length === 0) return;
    getOtherUserPostions();
  }, [usersAvatars, isNearby]);
  // console.log(useBootStore.getState().ready);

  // ------ Chat States
  const [chatInput, setChatInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  // ------------ Joy stick movments

  let lastSent = 0;

  const joystickMovements = (direction: Direction) => {
    const now = performance.now();
    if (now - lastSent < 20) return;
    lastSent = now;
    // console.log(joystickDirection);
    // joyStickDirectionRef.current = direction;
    // console.log(direction);
    dispatch(setJoyDirection(direction));
    // useControls("joy", direction);
    // setJoystickDirection(direction);
  };

  const { getJoystickDirection } = useJoyStick(mobileView, joystickMovements);

  return (
    <>
      <Box sx={{ position: "relative", padding: 0, minWidth: "0px" }}>
        <Stage
          height={canvasSize.height}
          width={canvasSize.width}
          options={{ backgroundAlpha: 0 }}
          // style={{ pointerEvents: "none" }}
        >
          <MainContainer
            canvasSize={canvasSize}
            userSprite={userSprite}
            socket={socket}
            socketAvatarId={socketAvatarId}
            socketUserId={socketUserId}
            socketUsername={socketUsername}
            chatInput={chatInput}
            userChat={userChat}
            userChatVisible={userChatVisible}
            dispatch={dispatch}
            isNearby={isNearby}
            getJoystickDirection={getJoystickDirection}
            setNearbyPlayers={setNearbyPlayers}
            nearbyPlayers={nearbyPlayers}
            setUsersAvatars={setUsersAvatars}
            usersAvatars={usersAvatars}
            onScreenPos={onScreenPos}
            setSelectedOtherUserAvatar={setSelectedOtherUserAvatar}
            setMultiplePopupsVisible={setMultiplePopupsVisible}
          />
        </Stage>
        <ChatInput
          chatInput={chatInput}
          setChatInput={setChatInput}
          chatOpen={chatOpen}
          setUserchat={setUserchat}
          setUserchatVisible={setUserchatVisible}
        />
        {usersAvatars.map((avatar) => {
          const pos = screenPos[avatar.username];
          if (!pos) return null;
          return (
            <Box key={avatar.id}>
              <AvatarVoicePrompt
                x={pos.x}
                y={pos.y}
                selectedOtherUserAvatar={selectedOtherUserAvatar}
                visible={multiplePopupsVisible[avatar.username] ?? false}
                setIsUserPermisssion={setIsUserPermisssion}
                avatarId={avatar.id}
                avatarUsername={avatar.username}
                setChatOpen={setChatOpen}
                setSelectedOtherUserAvatar={setSelectedOtherUserAvatar}
                setMultiplePopupsVisible={setMultiplePopupsVisible}
              />
              <IncomingCallPopup
                x={pos.x}
                y={pos.y}
                visible={offerVisible}
                setOfferVisible={setOfferVisible}
                caller={{ from: avatar.username, username: avatar.username }}
                avatarId={avatar.id}
              />
            </Box>
          );
        })}
      </Box>
    </>
  );
};

export default Arena;
