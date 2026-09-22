import { Texture } from "pixi.js";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { Container, Sprite } from "@pixi/react";
import HeroGrid from "./HeroGrid";
// import map from "../assets/tilemap.png";
import { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE } from "../constants/game-world";
import OtherAvatars from "./OtherAvatars";
import type {
  Direction,
  IAvatar,
  IncomingMessageData,
  IUserData,
  selectedUser,
} from "../types/common";
import Camera from "./Camera";
import { useBootStore } from "../store/bootstore";
import { wsManager } from "../socket/wsManager";
import type { AppDispatch } from "../redux/store";

interface IMainContainerProps {
  canvasSize: {
    height: number;
    width: number;
    scale: number;
  };
  userSprite: string;
  socket: WebSocket;
  userData: IUserData;
  chatInput: string;
  userChat: string;
  userChatVisible: boolean;
  dispatch: AppDispatch;
  isNearby: boolean;
  getJoystickDirection: any;
  setNearbyPlayers: React.Dispatch<React.SetStateAction<string[]>>;
  nearbyPlayers: string[];
  setUsersAvatars: React.Dispatch<React.SetStateAction<IAvatar[]>>;
  usersAvatars: IAvatar[];
  onScreenPos: React.RefObject<
    Record<
      string,
      {
        x: number;
        y: number;
      }
    >
  >;
  setSelectedOtherUserAvatar: React.Dispatch<
    React.SetStateAction<selectedUser>
  >;
  setMultiplePopupsVisible: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  multiplePopupsVisible: Record<string, boolean>;
  incomingMessageData: IncomingMessageData;
  setIncomingMessageData: React.Dispatch<
    React.SetStateAction<IncomingMessageData>
  >;
}

const MainContainer = ({
  canvasSize,
  userSprite,
  children,
  socket,
  userData,
  userChat,
  userChatVisible,
  dispatch,
  isNearby,
  getJoystickDirection,
  setNearbyPlayers,
  nearbyPlayers,
  setUsersAvatars,
  usersAvatars,
  onScreenPos,
  setSelectedOtherUserAvatar,
  setMultiplePopupsVisible,
  multiplePopupsVisible,
  incomingMessageData,
  setIncomingMessageData,
}: PropsWithChildren<IMainContainerProps>) => {
  const [currentDirection, setCurrentDirection] = useState<Direction | null>(
    null,
  );
  const [heroPosition, setHeroPosition] = useState({
    x: 0,
    y: 0,
  });
  // const joyStickDirectionRefconst  = useRef<Direction | null>(null);

  // ------------------- Chat codes ----------------

  // const bubbleTimer = import.meta.env.VITE_CHAT_BUBBLE_TIMEOUT;

  // const { socket, socketUserId, socketAvatarId } = Socket();

  useEffect(() => {
    if (!socket) return;

    // socket.emit("move-avatar", {
    //   id: socketUserId,
    //   username: socketUsername,
    //   x: heroPosition.x * TILE_SIZE,
    //   y: heroPosition.y * TILE_SIZE,
    //   direction: currentDirection,
    //   avatar: socketAvatarId,
    // });
    wsManager.sendMessage({
      type: "move_avatar",
      payload: {
        userId: userData.userId!,
        username: userData.username!,
        x: heroPosition.x * TILE_SIZE,
        y: heroPosition.y * TILE_SIZE,
        direction: currentDirection!,
        avatar: userData.avatarId!,
        roomId: "1",
      },
    });
  }, [heroPosition]);

  // useEffect(() => {
  //   console.log("usersAvatars", usersAvatars);
  // }, [usersAvatars]);

  useEffect(() => {
    if (!socket) return;
    const handleOthersAvatarMove = (data: IAvatar) => {
      // console.log("hanldeOther avatr", data);
      setUsersAvatars((prev) => {
        const index = prev.findIndex((item) => item.userId === data.userId);
        if (index !== -1) {
          let updated = [...prev];
          updated[index] = {
            userId: data.userId,
            x: data.x,
            y: data.y,
            direction: data.direction,
            avatar: data.avatar,
            username: data.username,
          };
          // console.log(
          //   "Received movement from other avatars",
          //   data
          //   // usersAvatars
          // );
          return updated;
        } else
          return [
            ...prev,
            {
              userId: data.userId,
              x: data.x,
              y: data.y,
              direction: data.direction,
              avatar: data.avatar,
              username: data.username,
            },
          ];
      });
    };

    const handleUserDisconnected = (data: { userId: string }) => {
      // console.log("user disconnected", userId);
      setUsersAvatars((prev) => {
        // const index = prev.findIndex((item) => item.userId === data.userId);
        // if (index !== -1) {
        //   prev.splice(index, 1);
        //   return prev;
        // } else return prev;
        return prev.filter((avatar) => avatar.userId !== data.userId);
      });
    };

    // const handleChatMessage = (data: any) => {
    //   // console.log(data);
    //   setChatMessageId(data.id);
    //   setChatMessage(data.chat);
    //   setIsBubbleVisible(true);
    //   setTimeout(() => {
    //     setIsBubbleVisible(false);
    //   }, bubbleTimer);
    // };

    const handleProximityChat = (data: {
      senderId: string;
      senderUsername: string;
      content: string;
      roomId: string;
      isNotification: boolean;
      conversationId: string;
      messageRequestId: string;
    }) => {
      // console.log("proximity message", data);
      const {
        senderId,
        senderUsername,
        content,
        isNotification,
        messageRequestId,
      } = data;

      setIncomingMessageData((prev) => ({
        ...prev,
        senderId,
        senderUsername,
        content,
        messageRequestId,
        isNotificationVisible: isNotification,
      }));

      setTimeout(() => {
        setIncomingMessageData((prev) => ({
          ...prev,
          isNotificationVisible: false,
        }));
      }, 25000);
    };

    wsManager.subscribe("other_avatar_move", handleOthersAvatarMove);
    wsManager.subscribe("user_disconnect", handleUserDisconnected);
    wsManager.subscribe("proximity_message", handleProximityChat);

    return () => {
      wsManager.unsubscribe("other_avatar_move", handleOthersAvatarMove);
      wsManager.unsubscribe("user_disconnect", handleUserDisconnected);
      wsManager.unsubscribe("proximity_message", handleProximityChat);
      // wsManager.unsubscribe("chat_message", handleChatMessage);
    };
  }, [socket]); //  Your socket is created asynchronously, so when this effect runs:socket === null
  //So events never fireThe moment socket is created → listener is added.

  const updateHeroPosition = useCallback((x: number, y: number) => {
    setHeroPosition({
      x: Math.floor(x / TILE_SIZE),
      y: Math.floor(y / TILE_SIZE),
    });
  }, []);

  const heroTexture = useMemo(() => {
    // console.log(userSprite);
    if (!userSprite) return null;
    const texure = Texture.from(userSprite);
    // console.log("Texure created", {
    //   valid: texure.baseTexture.valid,
    // });

    texure.baseTexture.once("loaded", () => {
      // at this point the image of avatar for user is finally loaded in browser
      // console.log("Texure GPU Ready");
      useBootStore.getState().markReady("AVATARS");
    });

    return texure;
  }, [userSprite]);

  const backgroundTexture = useMemo(() => {
    let backgroundSprite = "/avatars/arena-bg.png";
    const texure = Texture.from(backgroundSprite);
    // console.log(texure);
    texure.baseTexture.once("loaded", () => {
      // console.log("map ready");
      useBootStore.getState().markReady("PIXI");
    });
    return texure;
  }, []);
  const mapTexture = useMemo(() => {
    let mapSprite = "/tilemap.png";
    const texure = Texture.from(mapSprite);
    // console.log(texure);
    texure.baseTexture.once("loaded", () => {
      // console.log("map ready");
      useBootStore.getState().markReady("PIXI");
    });
    return texure;
  }, []);

  return (
    <>
      <Container scale={canvasSize.scale}>
        <Sprite
          // image={map}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          texture={backgroundTexture}
        />

        <Camera heroPosition={heroPosition} canvasSize={canvasSize}>
          <Sprite
            // image={map}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            texture={mapTexture}
            // scale={1}
            // x={OFFSET_X}
            // y={OFFSET_Y}
          />
          {children}
          <HeroGrid
            texture={heroTexture}
            updateHeroPosition={updateHeroPosition}
            setCurrentDirection={setCurrentDirection}
            usersAvatars={usersAvatars}
            userData={userData}
            socket={socket}
            setNearbyPlayers={setNearbyPlayers}
            userChat={userChat}
            userChatVisible={userChatVisible}
            dispatch={dispatch}
            isNearby={isNearby}
            getJoystickDirection={getJoystickDirection}
            // joystickMovements={joystickMovements}
            // joystickDirection={joystickDirection}
          />

          {usersAvatars
            .filter((avatar) => Boolean(avatar.userId))
            .map((avatar) => {
              return (
                <OtherAvatars
                  key={avatar.userId}
                  AVATAR_X_POS={avatar.x}
                  AVATAR_Y_POS={avatar.y}
                  AVATAR_DIRECTION={avatar.direction}
                  avatarId={avatar.userId}
                  AVATAR_IMAGE={avatar.avatar}
                  AVATAR_USERNAME={avatar.username}
                  nearbyPlayers={nearbyPlayers}
                  heroPosition={heroPosition}
                  isNearby={isNearby}
                  onScreenPos={onScreenPos}
                  setSelectedOtherUserAvatar={setSelectedOtherUserAvatar}
                  setMultiplePopupsVisible={setMultiplePopupsVisible}
                  multiplePopupsVisible={multiplePopupsVisible}
                  incomingMessageData={incomingMessageData}
                  setIncomingMessageData={setIncomingMessageData}
                  userData={userData}
                  dispatch={dispatch}
                />
              );
            })}
        </Camera>
      </Container>
    </>
  );
};

export default MainContainer;
