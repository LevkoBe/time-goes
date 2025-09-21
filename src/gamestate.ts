import {
  GameState as IGameState,
  GameConfig,
  Cell,
  Player as IPlayer,
  Tool,
  Coordinate as ICoordinate,
  Movement,
} from "./types.ts";
import { Player } from "./player.ts";
import { Coordinate } from "./Coordinate.ts";

export class GameState implements IGameState {
  config: GameConfig;
  timeSpace: Cell[][][];
  players: Player[];
  tools: Tool[];
  move: number;
  currentPlayerIndex: number;
  winner: Player | null;

  constructor(config: GameConfig) {
    this.config = config;
    this.timeSpace = this.initializeTimeSpace();
    this.players = this.initializePlayers();
    this.tools = [];
    this.move = 1;
    this.currentPlayerIndex = 0;
    this.winner = null;
  }

  private initializeTimeSpace(): Cell[][][] {
    const space: Cell[][][] = [];
    for (let t = 0; t < this.config.TIME; t++) {
      const timeSlice: Cell[][] = [];
      for (let x = 0; x < this.config.SIZE; x++) {
        const row: Cell[] = [];
        for (let y = 0; y < this.config.SIZE; y++) {
          row.push("empty");
        }
        timeSlice.push(row);
      }
      space.push(timeSlice);
    }
    return space;
  }

  private initializePlayers(): Player[] {
    const players: Player[] = [];
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"];

    for (let i = 0; i < this.config.PLAYERS; i++) {
      const player = new Player(
        i,
        `Player ${i + 1}`,
        colors[i % colors.length] ?? "#000000"
      );

      const startX = Math.floor(i / 2) * (this.config.SIZE - 1);
      const startY = (i % 2) * (this.config.SIZE - 1);
      const startCoord = new Coordinate(0, startX, startY);

      player.addMove(startCoord);
      if (this.timeSpace[0] && this.timeSpace[0][startX]) {
        this.timeSpace[0][startX][startY] = "player";
      }

      players.push(player);
    }

    return players;
  }

  getCurrentPlayer(): Player | null {
    return this.players[this.currentPlayerIndex] || null;
  }

  getValidMoves(player: IPlayer): Coordinate[] {
    if (!player || !player.getCurrentPosition()) return [];

    const currentPos = player.getCurrentPosition()!;
    const [t, x, y] = currentPos.pos;
    const validMoves: Coordinate[] = [];

    const movements: Movement[] = [
      [-1, 0, 0], // back in time
      [1, 0, 0], // forward in time
      [0, -1, 0], // left
      [0, 1, 0], // right
      [0, 0, -1], // up
      [0, 0, 1], // down
    ];

    movements.forEach((move) => {
      const newT = t + move[0];
      const newX = x + move[1];
      const newY = y + move[2];

      if (
        newT >= 0 &&
        newT < this.config.TIME &&
        newX >= 0 &&
        newX < this.config.SIZE &&
        newY >= 0 &&
        newY < this.config.SIZE
      ) {
        const newCoord = new Coordinate(newT, newX, newY);

        if (
          (this.timeSpace[newT] &&
            this.timeSpace[newT][newX] &&
            this.timeSpace[newT][newX][newY] === "empty") ||
          this.isPlayerAtPosition(player, newCoord)
        ) {
          validMoves.push(newCoord);
        }
      }
    });

    return validMoves;
  }

  isPlayerAtPosition(player: IPlayer, coordinate: ICoordinate): boolean {
    const [t, x, y] = coordinate.pos;
    return player.history.some(
      (pos) => pos.pos[0] === t && pos.pos[1] === x && pos.pos[2] === y
    );
  }

  makeMove(player: IPlayer, newPosition: ICoordinate): void {
    const oldPos = player.getCurrentPosition();
    if (oldPos) {
      const [oldT, oldX, oldY] = oldPos.pos;
      if (this.timeSpace[oldT] && this.timeSpace[oldT][oldX]) {
        this.timeSpace[oldT][oldX][oldY] = "empty";
      }
    }

    const [newT, newX, newY] = newPosition.pos;
    if (this.timeSpace[newT] && this.timeSpace[newT][newX]) {
      this.timeSpace[newT][newX][newY] = "player";
    }
    player.addMove(newPosition);

    this.checkTrapTriggers(player, newPosition);

    this.checkCollisions();

    this.nextPlayer();
  }

  checkTrapTriggers(player: IPlayer, position: ICoordinate): void {
    this.players.forEach((otherPlayer) => {
      otherPlayer.tools.forEach((tool) => {
        if (
          tool.toolType === "trap" &&
          !tool.visible &&
          tool.isTriggeredAt(position, position.pos[0])
        ) {
          console.log(`Player ${player.name} stepped on a trap!`);
          tool.apply(player);
        }
      });
    });
  }

  checkCollisions(): void {
    const occupiedPositions = new Map<string, IPlayer>();

    this.players.forEach((player) => {
      if (!player.alive) return;

      const pos = player.getCurrentPosition();
      if (pos) {
        const key = pos.toString();
        if (occupiedPositions.has(key)) {
          player.alive = false;
          const otherPlayer = occupiedPositions.get(key)!;
          otherPlayer.alive = false;
        } else {
          occupiedPositions.set(key, player);
        }
      }
    });

    this.checkWinCondition();
  }

  checkWinCondition(): void {
    const alivePlayers = this.players.filter((p) => p.alive);
    if (alivePlayers.length === 1) {
      this.winner = alivePlayers[0] ?? null;
    } else if (alivePlayers.length === 0) {
      this.winner = null;
    }
  }

  nextPlayer(): void {
    do {
      this.currentPlayerIndex =
        (this.currentPlayerIndex + 1) % this.players.length;
      if (this.currentPlayerIndex === 0) {
        this.move++;
      }
    } while (
      this.players[this.currentPlayerIndex] !== undefined &&
      !this.players[this.currentPlayerIndex]?.alive &&
      !this.winner
    );
  }

  getAlivePlayers(): Player[] {
    return this.players.filter((p) => p.alive);
  }

  useTool(player: IPlayer, targetPosition: ICoordinate): boolean {
    return player.useTool(targetPosition);
  }
}
