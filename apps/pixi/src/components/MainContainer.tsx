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
import type { Direction } from "../types/common";
import Camera from "./Camera";
import { useBootStore } from "../store/bootstore";

interface IMainContainerProps {
  canvasSize: {
    height: number;
    width: number;
    scale: number;
  };
  userSprite: string;
  socket: any;
  socketUserId: string;
  socketAvatarId: string;
  socketUsername: string;
  chatInput: string;
  userChat: string;
  userChatVisible: boolean;
}

interface IAvatar {
  id: string;
  x: number;
  y: number;
  direction: Direction;
  avatar: string;
  username: string;
}

const MainContainer = ({
  canvasSize,
  userSprite,
  children,
  socket,
  socketUserId,
  socketAvatarId,
  socketUsername,
  userChat,
  userChatVisible,
}: PropsWithChildren<IMainContainerProps>) => {
  const [usersAvatars, setUsersAvatars] = useState<IAvatar[]>([]);
  const [currentDirection, setCurrentDirection] = useState<Direction | null>(
    null
  );
  const [heroPosition, setHeroPosition] = useState({
    x: 0,
    y: 0,
  });
  const [nearbyPlayers, setNearbyPlayers] = useState<string[]>([]);

  // ------------------- Chat codes ----------------
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessageId, setChatMessageId] = useState("");
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);

  const bubbleTimer = import.meta.env.VITE_CHAT_BUBBLE_TIMEOUT;

  // const { socket, socketUserId, socketAvatarId } = Socket();

  useEffect(() => {
    if (!socket) return;

    socket.emit("move-avatar", {
      id: socketUserId,
      username: socketUsername,
      x: heroPosition.x * TILE_SIZE,
      y: heroPosition.y * TILE_SIZE,
      direction: currentDirection,
      avatar: socketAvatarId,
    });
  }, [heroPosition]);

  useEffect(() => {
    if (!socket) return;
    const handleOthersAvatarMove = (data: IAvatar) => {
      // console.log(data);
      setUsersAvatars((prev) => {
        const index = prev.findIndex((item) => item.id === data.id);
        if (index !== -1) {
          let updated = [...prev];
          updated[index] = {
            id: data.id,
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
              id: data.id,
              x: data.x,
              y: data.y,
              direction: data.direction,
              avatar: data.avatar,
              username: data.username,
            },
          ];
      });
    };

    const handleUserDisconnected = (userId: string) => {
      // console.log("user disconnected", userId);
      setUsersAvatars((prev) => {
        const index = prev.findIndex((item) => item.id === userId);
        if (index !== -1) {
          prev.splice(index, 1);
          return prev;
        } else return prev;
      });
    };

    const handleChatMessage = (data: any) => {
      // console.log(data);
      setChatMessageId(data.id);
      setChatMessage(data.chat);
      setIsBubbleVisible(true);
      setTimeout(() => {
        setIsBubbleVisible(false);
      }, bubbleTimer);
    };

    socket.on("other-avatar-move", handleOthersAvatarMove);
    socket.on("user-disconnected", handleUserDisconnected);
    socket.on("chat-message", handleChatMessage);

    return () => {
      socket.off("other-avatar-move", handleOthersAvatarMove);
      socket.off("user-disconnected", handleUserDisconnected);
      socket.off("chat-message", handleChatMessage);
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
            socketUserId={socketUserId}
            socket={socket}
            setNearbyPlayers={setNearbyPlayers}
            userChat={userChat}
            userChatVisible={userChatVisible}
          />

          {usersAvatars
            .filter((avatar) => Boolean(avatar.id))
            .map((avatar, index) => {
              return (
                <OtherAvatars
                  key={index}
                  AVATAR_X_POS={avatar.x}
                  AVATAR_Y_POS={avatar.y}
                  AVATAR_DIRECTION={avatar.direction}
                  avatarId={avatar.id}
                  AVATAR_IMAGE={avatar.avatar}
                  AVATAR_USERNAME={avatar.username}
                  nearbyPlayers={nearbyPlayers}
                  chatMessage={chatMessage}
                  isBubbleVisible={isBubbleVisible}
                  chatMessageId={chatMessageId}
                  heroPosition={heroPosition}
                />
              );
            })}
        </Camera>
      </Container>
    </>
  );
};

export default MainContainer;
