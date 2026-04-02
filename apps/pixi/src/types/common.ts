export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT" | undefined;

export type ReadyKey = "SOCKET" | "AVATARS" | "PIXI";

export interface IPosition {
  x: number;
  y: number;
}

export interface IAvatar {
  id: string;
  x: number;
  y: number;
  direction: Direction;
  avatar: string;
}

export type selectedAvatar = {
  id: string;
  username: string;
  avatarId: string;
} | null;
