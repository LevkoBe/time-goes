import type { GameConfig } from "./types";

export const GAME_CONFIG: GameConfig = {
  SIZE: 6,
  MIN_T: -5,
  MAX_T: 5,
  PLAYERS: ["A", "B"],
  WIN_CONDITION: 5,
};

export const SCORING = {
  MOVEMENT_REWARD: 0.1,
  SURVIVAL_REWARD: 0.5,
  CAPTURE_BONUS: 2,
  TRAP_PENALTY: -1,
  CAPTURE_PENALTY: -1,
} as const;

export const UI_CONFIG = {
  CELL_SIZE: 50,
  GRID_GAP: 2,
} as const;
