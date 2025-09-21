import { GameConfig, Player as IPlayer } from "./types.ts";
import { GameState } from "./gamestate.ts";
import { Coordinate } from "./coordinate.ts";

export class Game {
  config: GameConfig;
  gameState: GameState;

  constructor() {
    this.config = {
      SIZE: 4,
      TIME: 3,
      PLAYERS: 2,
    };
    this.gameState = new GameState(this.config);
    this.render();
  }

  render(): void {
    this.renderBoards();
    this.renderGameInfo();
    this.renderPlayerInfo();

    if (this.gameState.winner) {
      this.showWinner();
    }
  }

  renderBoards(): void {
    const container = document.getElementById("game-boards")!;
    container.innerHTML = "";

    for (let t = 0; t < this.config.TIME; t++) {
      const timeSliceDiv = document.createElement("div");
      timeSliceDiv.className = "time-slice";

      const timeLabel = document.createElement("div");
      timeLabel.className = "time-label";
      timeLabel.textContent = `Time t = ${t}`;
      timeSliceDiv.appendChild(timeLabel);

      const boardDiv = document.createElement("div");
      boardDiv.className = "board";
      boardDiv.style.gridTemplateColumns = `repeat(${this.config.SIZE}, 1fr)`;

      const currentPlayer = this.gameState.getCurrentPlayer();
      const validMoves = currentPlayer
        ? this.gameState.getValidMoves(currentPlayer)
        : [];

      for (let x = 0; x < this.config.SIZE; x++) {
        for (let y = 0; y < this.config.SIZE; y++) {
          const cell = document.createElement("div");
          cell.className = "cell";
          cell.dataset.t = t.toString();
          cell.dataset.x = x.toString();
          cell.dataset.y = y.toString();

          const playerAtCell = this.getPlayerAtPosition(
            new Coordinate(t, x, y)
          );
          if (playerAtCell) {
            if (playerAtCell === currentPlayer) {
              cell.classList.add("current-player");
            } else {
              cell.classList.add("other-player");
            }
            cell.style.background = playerAtCell.color;
            cell.textContent = (playerAtCell.id + 1).toString();
          }

          const isValidMove = validMoves.some(
            (move) =>
              move.pos[0] === t && move.pos[1] === x && move.pos[2] === y
          );
          if (isValidMove) {
            cell.classList.add("possible-move");

            if (
              currentPlayer &&
              currentPlayer.getActiveTool() &&
              !currentPlayer.getActiveTool()!.triggered
            ) {
              cell.classList.add("trap-target");
            }
          }

          const hasHistory = this.gameState.players.some((player) =>
            player.history.some(
              (pos) => pos.pos[0] === t && pos.pos[1] === x && pos.pos[2] === y
            )
          );
          if (hasHistory && !playerAtCell) {
            cell.classList.add("history-trail");
          }

          if (currentPlayer) {
            const hasTrapHere = currentPlayer.tools.some(
              (tool) =>
                tool.toolType === "trap" &&
                tool.attachment instanceof Coordinate &&
                tool.attachment.pos[1] === x &&
                tool.attachment.pos[2] === y &&
                tool.attachment.pos[0] <= t
            );

            if (hasTrapHere) {
              const trapIndicator = document.createElement("div");
              trapIndicator.className = "trap-indicator";
              trapIndicator.title = "Your trap is here";
              cell.appendChild(trapIndicator);
            }
          }

          cell.addEventListener("click", (e) => {
            e.preventDefault();
            this.handleCellClick(t, x, y, false);
          });

          cell.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.handleCellClick(t, x, y, true);
          });

          boardDiv.appendChild(cell);
        }
      }

      timeSliceDiv.appendChild(boardDiv);
      container.appendChild(timeSliceDiv);
    }
  }

  renderGameInfo(): void {
    document.getElementById("current-move")!.textContent =
      this.gameState.move.toString();
    document.getElementById("current-player")!.textContent =
      this.gameState.getCurrentPlayer()?.name || "Game Over";
    document.getElementById("players-alive")!.textContent = this.gameState
      .getAlivePlayers()
      .length.toString();

    const currentPlayer = this.gameState.getCurrentPlayer();
    const currentPos = currentPlayer?.getCurrentPosition();
    document.getElementById("current-time")!.textContent = currentPos
      ? `t = ${currentPos.pos[0]}`
      : "N/A";
  }

  renderPlayerInfo(): void {
    const container = document.getElementById("players-list")!;
    container.innerHTML = "";

    this.gameState.players.forEach((player) => {
      const card = document.createElement("div");
      card.className = "player-card";
      if (player === this.gameState.getCurrentPlayer()) {
        card.classList.add("current");
      }

      const name = document.createElement("div");
      name.className = "player-name";
      name.textContent = player.name;
      name.style.color = player.color;

      const status = document.createElement("div");
      status.className = "player-status";
      status.textContent = player.alive ? "Alive" : "Eliminated";

      const position = document.createElement("div");
      position.className = "player-status";
      const currentPos = player.getCurrentPosition();
      position.textContent = currentPos
        ? `Position: ${currentPos.toString()}`
        : "No position";

      const toolInfo = document.createElement("div");
      toolInfo.className = "tool-info";
      const activeTool = player.getActiveTool();
      if (activeTool) {
        const toolStatus = activeTool.triggered ? "Used" : "Ready";
        const statusClass = activeTool.triggered ? "tool-used" : "tool-status";
        toolInfo.innerHTML = `<span class="${statusClass}">🪤 Trap: ${toolStatus}</span>`;
      }

      card.appendChild(name);
      card.appendChild(status);
      card.appendChild(position);
      card.appendChild(toolInfo);
      container.appendChild(card);
    });
  }

  getPlayerAtPosition(coordinate: Coordinate): IPlayer | null {
    return (
      this.gameState.players.find(
        (player) =>
          player.alive && player.getCurrentPosition()?.equals(coordinate)
      ) || null
    );
  }

  handleCellClick(
    t: number,
    x: number,
    y: number,
    isRightClick: boolean = false
  ): void {
    if (this.gameState.winner) return;

    const currentPlayer = this.gameState.getCurrentPlayer();
    if (!currentPlayer) return;

    const clickedPosition = new Coordinate(t, x, y);
    const validMoves = this.gameState.getValidMoves(currentPlayer);

    const isValidMove = validMoves.some((move) => move.equals(clickedPosition));

    if (isValidMove) {
      if (isRightClick) {
        const activeTool = currentPlayer.getActiveTool();
        if (activeTool && !activeTool.triggered) {
          const success = this.gameState.useTool(
            currentPlayer,
            clickedPosition
          );
          if (success) {
            console.log(
              `${
                currentPlayer.name
              } placed a trap at ${clickedPosition.toString()}`
            );
            this.gameState.nextPlayer();
            this.render();
          }
        }
      } else {
        this.gameState.makeMove(currentPlayer, clickedPosition);
        this.render();
      }
    }
  }

  showWinner(): void {
    const overlay = document.createElement("div");
    overlay.className = "winner-announcement";

    const winnerText = document.createElement("div");
    winnerText.className = "winner-text";
    winnerText.textContent = `🏆 ${this.gameState.winner!.name} Wins!`;
    winnerText.style.color = this.gameState.winner!.color;

    const newGameBtn = document.createElement("button");
    newGameBtn.className = "btn";
    newGameBtn.textContent = "🔄 New Game";
    newGameBtn.onclick = () => {
      document.body.removeChild(overlay);
      this.resetGame();
    };

    overlay.appendChild(winnerText);
    overlay.appendChild(newGameBtn);
    document.body.appendChild(overlay);
  }

  resetGame(): void {
    this.gameState = new GameState(this.config);
    this.render();
  }

  showInstructions(): void {
    alert(`Time Travel Strategy Game Instructions:

🎯 OBJECTIVE: Be the last player standing

🎮 MOVEMENT:
• LEFT CLICK on green cells to move
• Move one step in any direction per turn
• Can move in space (up/down/left/right) or time (forward/backward)

🪤 TRAPS:
• RIGHT CLICK on orange cells to place traps
• Each player starts with one trap
• Traps are invisible to enemies but persist through time
• Red dots show YOUR trap locations (for reference)
• Traps trigger when enemies step on them → elimination

⏰ TIME TRAVEL:
• Travel to past time slices (t=0, t=1, etc.)
• Travel to future time slices to explore
• Traps placed in the past will persist to the future
• Your path through time creates a history trail

⚠️ RULES:
• Cannot move to cells occupied by other players
• Colliding with another player eliminates both
• Stepping on enemy traps eliminates you
• Changing the past may create paradoxes (future feature)

🏆 WIN CONDITIONS:
• Last player alive wins
• Game ends when only one player remains

🎮 CONTROLS:
• LEFT CLICK = Move
• RIGHT CLICK = Place Trap

Good luck, time traveler!`);
  }
}
