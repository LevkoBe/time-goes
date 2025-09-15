export type Cell = "empty" | "player" | "object";
type UNIT = 1 | -1;
export type Movement = [UNIT, 0, 0] | [0, UNIT, 0] | [0, 0, UNIT];
export interface Coordinate {
  pos: [number, number, number];
  add: (move: Movement) => this;
}

// toolType: "trap" | "gun" | "cloner" | "teleport" | "detector" | "amplifier";
export type Target = Player | Coordinate | Tool;
type Application = (to: Target) => void;

export interface Tool {
  visible: boolean;
  history: {
    attachment: Target;
    toolAction: "apply" | "attach";
    target: Target;
  }[];
  apply: Application;
  unapply: Application;
  attach: Application;
}
export interface Player {
  id: number;
  name: string;
  color: string;
  history: Coordinate[];
}

export interface GameState {
  timeSpace: Cell[][][];
  players: Player[];
  tools: Tool[];
  move: number;
  player: number;
  winner: Player | null;
}
export interface GameConfig {
  SIZE: number;
  TIME: number;
  PLAYERS: number;
}
