import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ANIMATION_SPEED,
  MOVE_SPEED,
  // TILE_SIZE,
  // TILE_SIZE,
} from "../constants/game-world";
import type { Direction } from "../types/common";
import { useHeroAnimation } from "../hook/useHeroAnimation";
import {
  calculateNewTarget,
  // calculateNewTarget,
  checkCanMove,
  handleMovement,
} from "../helper/common";
import { Container, Sprite, Text, useTick } from "@pixi/react";
import { TextStyle, Texture as TextureImport } from "pixi.js";
import ChatBubble from "../helper/chatBubble";

// import { useControls } from "../hook/useControls";

interface IHeroProps {
  AVATAR_Y_POS: number;
  AVATAR_X_POS: number;
  avatarId: string;
  AVATAR_DIRECTION: Direction;
  AVATAR_IMAGE: string;
  AVATAR_USERNAME: string;
  nearbyPlayers: string[];
  chatMessage: string;
  isBubbleVisible: boolean;
  chatMessageId: string;
  heroPosition: { x: number; y: number };
  isNearby: boolean;
  //   updateHeroPosition: (x: number, y: number) => void;
}

const textStyle = new TextStyle({
  fill: "#ffffff",
  fontSize: 12,
  fontWeight: "bold",
  stroke: "#000",
  strokeThickness: 4,
  dropShadow: true,
  dropShadowColor: "#000",
});

const OtherAvatars = ({
  AVATAR_X_POS,
  AVATAR_Y_POS,
  AVATAR_DIRECTION,
  AVATAR_IMAGE,
  AVATAR_USERNAME,
  // nearbyPlayers,
  avatarId,
  chatMessage,
  isBubbleVisible,
  chatMessageId,
  // heroPosition,
  isNearby
}: IHeroProps) => {
  const avatar_position = useRef({
    x: AVATAR_X_POS,
    y: AVATAR_Y_POS,
  }); // Tracks the current pixel coordinates of the hero on the map.
  const targetPosition = useRef<{ x: number; y: number } | null>(null); //If the hero is moving, this is the destination cell’s pixel coordinates. If null, the hero is idle.
  const currentDirection = useRef<Direction | null>(null); // Current facing/moving direction, e.g., "UP", "DOWN".
  const isMoving = useRef(false);

  // const isNearby = nearbyPlayers.includes(avatarId);
  // const isWithinRange = (x1: number, y1: number, x2: number, y2: number) => {
  //   const dx = x1 - x2;
  //   const dy = y1 - y2;
  //   return Math.sqrt(dx * dx + dy * dy) < 120; // same threshold as yours
  // };

  // compute hero pixel coords from heroPosition (tile -> pixel)
  // const heroPixelX = heroPosition.x * TILE_SIZE;
  // const heroPixelY = heroPosition.y * TILE_SIZE;

  // avatar_position.current contains avatar pixel coords already
  // const isNearby = isWithinRange(
  //   avatar_position.current.x,
  //   avatar_position.current.y,
  //   heroPixelX,
  //   heroPixelY
  // );
  // console.log(isNearby, heroPixelX, heroPixelY);

  const texture = useMemo(
    () => TextureImport.from(`/avatars/${AVATAR_IMAGE}.png`),
    []
  );

  useEffect(() => {
    avatar_position.current = { x: AVATAR_X_POS, y: AVATAR_Y_POS };
    targetPosition.current = null; // reset current animation target if needed
    isMoving.current = false; // update movement flag
    // Optionally: update direction ref if you use it elsewhere
    currentDirection.current = AVATAR_DIRECTION;
  }, [AVATAR_X_POS, AVATAR_Y_POS, AVATAR_DIRECTION]);

  const { sprite, updateSprite } = useHeroAnimation({
    texture,
    frameWidth: 64,
    frameHeight: 64,
    totalFrames: 9,
    animationSpeed: ANIMATION_SPEED,
  });

  //When an arrow key is pressed, this decides if a move should start and which cell to move toward.
  const setNextTarget = useCallback((direction: Direction) => {
    if (targetPosition.current) return; // If already moving, ignores new inputs until arrived.
    const { x, y } = avatar_position.current;
    currentDirection.current = direction;
    // console.log(x, y, direction, "Setnext target");
    const newTarget = calculateNewTarget(x, y, direction);
    // console.log(
    //   "x:" + x,
    //   "y:" + y,
    //   "newTarget.x:" + newTarget.x,
    //   "newTarget.y:" + newTarget.y
    // );
    if (checkCanMove(newTarget)) targetPosition.current = newTarget;
  }, []);

  useEffect(() => {
    avatar_position.current = { x: AVATAR_X_POS, y: AVATAR_Y_POS };
    currentDirection.current = AVATAR_DIRECTION;
    // Trigger movement when direction changes and not already moving
    if (AVATAR_DIRECTION && !targetPosition.current) {
      setNextTarget(AVATAR_DIRECTION);
    }
  }, [AVATAR_DIRECTION, AVATAR_X_POS, AVATAR_Y_POS]);

  useTick((delta) => {
    if (targetPosition.current) {
      const { position: newPosition, completed } = handleMovement(
        avatar_position.current,
        targetPosition.current,
        MOVE_SPEED,
        delta
      );

      avatar_position.current = newPosition;
      isMoving.current = true;

      if (completed) {
        targetPosition.current = null;
        isMoving.current = false;
      }
    }

    updateSprite(currentDirection.current!, isMoving.current);
  });

  return (
    <>
      <Container y={avatar_position.current.y} x={avatar_position.current.x}>
        <Text
          text={
            AVATAR_USERNAME.length > 8
              ? `${AVATAR_USERNAME.substring(0, 5)}...`
              : AVATAR_USERNAME
          }
          anchor={0.5}
          x={26}
          tint={isNearby ? 0xffee88 : 0xffffff} // glowing yellow tint
          y={-18} // moves text above the avatar
          style={textStyle}
        />
        {sprite && (
          <Sprite
            texture={sprite.texture}
            scale={0.8}
            anchor={[0, 0.3]}
            tint={isNearby ? 0xffee88 : 0xffffff} // glowing yellow tint
          />
        )}
        {/* Chat bubble */}

        {isBubbleVisible &&
          // isNearby &&
          (chatMessageId === avatarId ? (
            <ChatBubble message={chatMessage} />
          ) : null)}
      </Container>
    </>
  );
};

export default OtherAvatars;
