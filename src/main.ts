import { Game } from "./game.ts";

const game = new Game();

// globally available for button handlers
(window as any).game = game;
