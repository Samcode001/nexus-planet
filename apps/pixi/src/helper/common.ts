import { COLLISION_MAP } from "../constants/new_collision_map";
import {
  COLS,
  GAME_HEIGHT,
  GAME_WIDTH,
  TILE_SIZE,
} from "../constants/game-world";
import type { Direction, IAvatar, IPosition } from "../types/common";

export const calcluateDimesions = () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight * 0.99;

  const scale = Math.min(windowHeight / GAME_HEIGHT, windowWidth / GAME_WIDTH); // its for how zoomed the image should be
  const height = GAME_HEIGHT * scale;
  const width = GAME_WIDTH * scale;

  // const height = windowHeight
  // const width = windowWidth
  // console.log(windowHeight, windowWidth);
  // console.log(height, width, scale);
  return { height, width, scale };
};

export const calculateNewTarget = (
  // Calculates next cell based on current position and direction
  x: number,
  y: number,
  direction: Direction
): IPosition => {
  return {
    x:
      (x / TILE_SIZE) * TILE_SIZE +
      (direction === "LEFT"
        ? -TILE_SIZE
        : direction === "RIGHT"
          ? TILE_SIZE
          : 0),
    y:
      (y / TILE_SIZE) * TILE_SIZE +
      (direction === "UP" ? -TILE_SIZE : direction === "DOWN" ? TILE_SIZE : 0),
  };
};

export const calculateNewTargetDiagonal = (
  x: number,
  y: number,
  direction: Direction
) => {
  let dx = 0;
  let dy = 0;

  if (direction === "UP") dy -= 1;
  if (direction === "DOWN") dy += 1;
  if (direction === "RIGHT") dx += 1;
  if (direction === "LEFT") dx -= 1;

  const magiun = Math.sqrt(dx * dx + dy * dy);
  if (magiun > 0) {
    dx = dx / magiun;
    dy = dy / magiun;
  }
  return { x: x + dx, y: y + dy };
};

export const checkCanMove = (target: IPosition) => {
  // check for obstacle or map Boundries
  const row = Math.floor(target.y / TILE_SIZE);
  const col = Math.floor(target.x / TILE_SIZE);
  const index = COLS * row + col;

  if (index < 0 || index >= COLLISION_MAP.length) {
    return false;
  }

  return COLLISION_MAP[index] !== 1;
};

export function isPlayerBlocking(
  targetX: number,
  targetY: number,
  avatars: IAvatar[]
) {
  // const TILE = 32;
  const targetTile = {
    col: Math.floor(targetX),
    row: Math.floor(targetY),
  };
  // console.log("Is BLocking", targetX, targetY);
  // console.log(avatars);
  return avatars.some((avatar) => {
    const avatarTile = {
      col: Math.floor(avatar.x),
      row: Math.floor(avatar.y),
    };
    // console.log("PlyaerBoliking", targetTile, avatarTile);
    if (avatarTile.col === targetTile.col && avatarTile.row === targetTile.row)
      console.log("tile matched");
    return (
      avatarTile.col === targetTile.col && avatarTile.row === targetTile.row
    );
  });
}

export const moveTowards = (
  current: number,
  target: number,
  maxStep: number
) => {
  return (
    current +
    Math.sign(target - current) * Math.min(Math.abs(target - current), maxStep)
  );
};

export const continueMovement = (
  currentPosition: IPosition,
  targetPosition: IPosition,
  step: number
): IPosition => {
  return {
    x: moveTowards(currentPosition.x, targetPosition.x, step),
    y: moveTowards(currentPosition.y, targetPosition.y, step),
  };
};

export const handleMovement = (
  currentPosition: IPosition,
  targetPosition: IPosition,
  moveSpeed: number,
  delta: number
) => {
  const step = moveSpeed * TILE_SIZE * delta;
  const distance = Math.hypot(
    targetPosition.x - currentPosition.x,
    targetPosition.y - currentPosition.y
  );

  if (distance <= step) {
    return {
      position: targetPosition,
      completed: true,
    };
  }

  return {
    position: continueMovement(currentPosition, targetPosition, step),
    completed: false,
  };
};
