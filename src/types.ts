export type Cell = "empty" | "player" | "object";
type UNIT = 1 | -1;
export type Movement = [UNIT, 0, 0] | [0, UNIT, 0] | [0, 0, UNIT];

export interface Coordinate {
  pos: [number, number, number];
  add: (move: Movement) => this;
  clone: () => Coordinate;
  equals: (other: Coordinate) => boolean;
  toString: () => string;
}

export type Target = Player | Coordinate | Tool;
type Application = (to: Target) => void;

export interface Tool {
  toolType: string;
  visible: boolean;
  attachment: Target | null;
  history: {
    toolAction: "apply" | "attach";
    target: Target;
  }[];
  triggered: boolean;
  apply: Application;
  unapply: Application;
  attach: (coordinate: Coordinate) => void;
  isTriggeredAt: (coordinate: Coordinate, currentTime: number) => boolean;
}

export interface Player {
  id: number;
  name: string;
  color: string;
  history: Coordinate[];
  alive: boolean;
  currentPosition: Coordinate | null;
  tools: Tool[];
  activeToolIndex: number;
  getCurrentPosition: () => Coordinate | null;
  addMove: (coordinate: Coordinate) => void;
  getActiveTool: () => Tool | null;
  useTool: (coordinate: Coordinate) => boolean;
}

export interface GameState {
  config: GameConfig;
  timeSpace: Cell[][][];
  players: Player[];
  tools: Tool[];
  move: number;
  currentPlayerIndex: number;
  winner: Player | null;

  getCurrentPlayer: () => Player | null;
  getValidMoves: (player: Player) => Coordinate[];
  isPlayerAtPosition: (player: Player, coordinate: Coordinate) => boolean;
  makeMove: (player: Player, newPosition: Coordinate) => void;
  checkTrapTriggers: (player: Player, position: Coordinate) => void;
  checkCollisions: () => void;
  checkWinCondition: () => void;
  nextPlayer: () => void;
  getAlivePlayers: () => Player[];
  useTool: (player: Player, targetPosition: Coordinate) => boolean;
}

export interface GameConfig {
  SIZE: number;
  TIME: number;
  PLAYERS: number;
}
