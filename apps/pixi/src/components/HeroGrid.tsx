import { useCallback, useEffect, useRef, useState } from "react";
import {
  ANIMATION_SPEED,
  DEFAULT_X_POS,
  DEFAULT_Y_POS,
  MOVE_SPEED,
} from "../constants/game-world";
import type { Direction, IAvatar } from "../types/common";
import { useHeroAnimation } from "../hook/useHeroAnimation";
import { TextStyle, type Texture } from "pixi.js";
import {
  calculateNewTarget,
  checkCanMove,
  handleMovement,
  isPlayerBlocking,
} from "../helper/common";
import { Container, Sprite, Text, useTick } from "@pixi/react";
import { useControls } from "../hook/useControls";
import ChatBubble from "../helper/chatBubble";
// import { useAppDispatch } from "../redux/hook";
import { setIsNearby } from "../redux/Proximity/proximitySlice";
interface IHeroProps {
  texture: Texture | null;
  updateHeroPosition: (x: number, y: number) => void;
  setCurrentDirection: (direction: Direction) => void;
  usersAvatars: IAvatar[];
  socket: any;
  socketUserId: any;
  setNearbyPlayers: React.Dispatch<React.SetStateAction<string[]>>;
  userChat: string;
  userChatVisible: boolean;
  dispatch: any;
  isNearby: boolean;
}

const textStyle = new TextStyle({
  fontSize: 16,
});

const HeroGrid = ({
  texture,
  updateHeroPosition,
  setCurrentDirection,
  usersAvatars,
  socketUserId,
  setNearbyPlayers,
  userChat,
  userChatVisible,
  socket,
  dispatch,
  isNearby,
}: IHeroProps) => {
  const [isSpawned, setIsSpawned] = useState(false);
  const position = useRef({
    x: DEFAULT_X_POS,
    y: DEFAULT_Y_POS,
  }); // Tracks the current pixel coordinates of the hero on the map.
  const targetPosition = useRef<{ x: number; y: number } | null>(null); //If the hero is moving, this is the destination cell’s pixel coordinates. If null, the hero is idle.
  const currentDirection = useRef<Direction | null>(null); // Current facing/moving direction, e.g., "UP", "DOWN".
  const isMoving = useRef(false);

  const { getControlsDirection } = useControls();

  const { sprite, updateSprite } = useHeroAnimation({
    texture,
    frameWidth: 64,
    frameHeight: 64,
    totalFrames: 9,
    animationSpeed: ANIMATION_SPEED,
  });

  // ------------------- Chat Codes ----------------------start
  // const [isNearby, setIsNearby] = useState(false);
 

  const isWithinRange = (
    { x1, y1 }: { x1: number; y1: number },
    { x2, y2 }: { x2: number; y2: number }
  ) => {
    let dx = x1 - x2;
    let dy = y1 - y2;
    let dist = Math.sqrt(dx * dx + dy * dy);
    // console.log(x1, y1, x2, y2, dist);
    return dist < 120;
  };

  // -----------------------------------------------------------end

  // useEffect(() => {
  //   if (!userInitialPosition) return;

  //   position.current = userInitialPosition;
  //   updateHeroPosition(userInitialPosition.x, userInitialPosition.y);
  //   isSpawned.current = true;
  // }, [userInitialPosition]);

  //When an arrow key is pressed, this decides if a move should start and which cell to move toward.
  const setNextTarget = useCallback((direction: Direction) => {
    // console.log("on movememtn" + JSON.stringify(position.current));

    if (targetPosition.current) return; // If already moving, ignores new inputs until arrived.
    const { x, y } = position.current;
    updateHeroPosition(x, y); // after setting the postions from here we are emmiting the move-avatar socket connection and its values
    currentDirection.current = direction;
    const newTarget = calculateNewTarget(x, y, direction);
    // const isBlocking = isPlayerBlocking(newTarget.x, newTarget.y, usersAvatars);
    // console.log(
    //   isBlocking,
    //   "x:" + x,
    //   "y:" + y,
    //   "newTarget.x:" + newTarget.x,
    //   "newTarget.y:" + newTarget.y
    // );
    // console.log("inside", usersAvatars);

    if (checkCanMove(newTarget)) {
      setCurrentDirection(direction);
      targetPosition.current = newTarget;
    }
  }, []);

  const handleNearbyUsers = (x: number, y: number) => {
    const nearbyUsers = usersAvatars
      .filter((user) => user.id !== socketUserId)
      .filter((user) =>
        isWithinRange({ x1: x, y1: y }, { x2: user.x, y2: user.y })
      )
      .map((user) => user.id);
    setNearbyPlayers(nearbyUsers);
    // console.log(nearbyUsers);
    if (nearbyUsers.length > 0) {
      // setIsNearby(true);
      dispatch(setIsNearby(true));
    } else {
      dispatch(setIsNearby(false));
    }
  };

  useEffect(() => {
    handleNearbyUsers(position.current.x, position.current.y);
  }, [usersAvatars]);

  useEffect(() => {
    // console.log("on mount positon" + JSON.stringify(position.current));
    updateHeroPosition(position.current.x, position.current.y);
    setIsSpawned(true);
  }, []);

  useEffect(() => {
    // console.log("usersAvatars", usersAvatars);
    if (!socket) return;

    const handleLastPosition = (data: any) => {
      // console.log("last position on socket repsone", data);

      position.current = {
        x: Number(data.x),
        y: Number(data.y),
      };
      currentDirection.current = data.direction;
      setIsSpawned(true);
      updateHeroPosition(position.current.x, position.current.y);
      // console.log("position on socket repsone", position.current);
    };

    socket.on("last-position", handleLastPosition);
    return () => {
      socket.off("last-position", handleLastPosition);
    };
  }, [socket]); // when the socket is connected via server its start the .on listening

  useTick((delta) => {
    // Inside here everything run 60 frame per secodn so dont do the react stste update in here it costly
    //  console.log(position)
    if (!isSpawned) return;

    const checkPlayerBlock = (direction: Direction) => {
      if (targetPosition.current) return; // If already moving, ignores new inputs until arrived.
      const { x, y } = position.current;
      const newTarget = calculateNewTarget(x, y, direction);
      const isBlocking = isPlayerBlocking(
        newTarget.x,
        newTarget.y,
        usersAvatars
      );
      return isBlocking;
    };

    const { currentKey } = getControlsDirection();
    if (currentKey && !checkPlayerBlock(currentKey)) {
      setNextTarget(currentKey);
    }

    if (targetPosition.current) {
      const { position: newPosition, completed } = handleMovement(
        position.current,
        targetPosition.current,
        MOVE_SPEED,
        delta
      );

      position.current = newPosition;
      isMoving.current = true;

      if (completed) {
        const { x, y } = position.current;
        handleNearbyUsers(x, y);
        targetPosition.current = null;
        isMoving.current = false;
      }
    }

    updateSprite(currentDirection.current!, isMoving.current);
  });

  return (
    <>
      <Container x={position.current.x} y={position.current.y}>
        {sprite && (
          <Sprite texture={sprite.texture} scale={0.8} anchor={[0, 0.3]} />
        )}

        {isNearby && (
          <Text text="💬" anchor={0.5} y={-11} x={37} style={textStyle} />
        )}
        {userChatVisible && <ChatBubble message={userChat} />}
      </Container>
    </>
  );
};

export default HeroGrid;
