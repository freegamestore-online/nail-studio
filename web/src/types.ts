export type NailShape = "round" | "square" | "almond" | "coffin" | "stiletto";

export type NailDecoration = "none" | "glitter" | "stars" | "hearts" | "flowers" | "gems";

export interface NailState {
  color: string;
  decoration: NailDecoration;
  painted: boolean;
}

export interface Sparkle {
  id: number;
  x: number;
  y: number;
  color: string;
  life: number; // 0..1
  vx: number;
  vy: number;
  size: number;
}

export type Hand = "left" | "right";
