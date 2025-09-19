const BOARD_SIZE = 5;
const TIME_LAYERS = 3;
const PLAYER_COUNT = 2;

interface Player {
  id: number;
  name: string;
  alive: boolean;
  pos: [number, number, number];
  history: [number, number, number][];
  unlockedTimes: number[];
}

interface GameState {
  timeSpace: (string | null)[][][];
  players: Player[];
  tools: string[];
  currentPlayer: number;
  turn: number;
  winner: Player | null;
  selectedTool: string | null;
  log: string[];
}

class Game implements GameState {
  timeSpace: (string | null)[][][];
  players: Player[];
  tools: string[];
  currentPlayer: number;
  turn: number;
  winner: Player | null;
  selectedTool: string | null;
  log: string[];

  constructor() {
    this.timeSpace = Array(TIME_LAYERS)
      .fill(null)
      .map(() =>
        Array(BOARD_SIZE)
          .fill(null)
          .map(() => Array(BOARD_SIZE).fill(null))
      );

    this.players = Array(PLAYER_COUNT)
      .fill(null)
      .map((_, i) => ({
        id: i,
        name: `Player ${i + 1}`,
        alive: true,
        pos: [i * 2, i * 2, 1],
        history: [[i * 2, i * 2, 1]],
        unlockedTimes: [1],
      }));

    this.tools = [];
    this.currentPlayer = 0;
    this.turn = 1;
    this.winner = null;
    this.selectedTool = null;
    this.log = [];

    this.players.forEach((p) => {
      if (p.alive)
        this.timeSpace[p.pos[2]][p.pos[1]][p.pos[0]] = `player-${p.id}`;
    });
  }
}

const game = new Game();

function log(message: string) {
  game.log.push(`Turn ${game.turn}: ${message}`);
  updateLog();
}

function updateLog() {
  const logEl = document.getElementById("log")!;
  logEl.innerHTML = game.log.slice(-20).join("<br>");
  logEl.scrollTop = logEl.scrollHeight;
}

function isValidMove(
  from: [number, number, number],
  to: [number, number, number]
) {
  if (
    to[0] < 0 ||
    to[0] >= BOARD_SIZE ||
    to[1] < 0 ||
    to[1] >= BOARD_SIZE ||
    to[2] < 0 ||
    to[2] >= TIME_LAYERS
  )
    return false;

  const diff = to.map((val, i) => val - from[i]);
  const nonZero = diff.filter((d) => d !== 0);
  return nonZero.length === 1 && Math.abs(nonZero[0]) === 1;
}

function move(dx: number, dy: number, dt: number) {
  const player = game.players[game.currentPlayer];
  if (!player.alive) return;

  const newPos: [number, number, number] = [
    player.pos[0] + dx,
    player.pos[1] + dy,
    player.pos[2] + dt,
  ];
  if (!isValidMove(player.pos, newPos)) {
    log(`Invalid move for ${player.name}`);
    return;
  }

  if (game.selectedTool) {
    applyTool(game.selectedTool, newPos);
    game.selectedTool = null;
    (document.getElementById("toolSelect") as HTMLSelectElement).value = "";
  }

  game.timeSpace[player.pos[2]][player.pos[1]][player.pos[0]] = null;

  player.pos = newPos;
  player.history.push([...newPos] as [number, number, number]);

  if (!player.unlockedTimes.includes(newPos[2]))
    player.unlockedTimes.push(newPos[2]);

  const cellContent = game.timeSpace[newPos[2]][newPos[1]][newPos[0]];
  if (cellContent === "trap") {
    log(`${player.name} stepped on a trap and died!`);
    player.alive = false;
    game.timeSpace[newPos[2]][newPos[1]][newPos[0]] = null;
  } else {
    game.timeSpace[newPos[2]][newPos[1]][newPos[0]] = `player-${player.id}`;
  }

  log(`${player.name} moved to (${newPos[0]},${newPos[1]},T${newPos[2]})`);

  checkParadoxes();
  endTurn();
}

function applyTool(tool: string, targetPos: [number, number, number]) {
  const player = game.players[game.currentPlayer];
  if (tool === "trap") {
    game.timeSpace[targetPos[2]][targetPos[1]][targetPos[0]] = "trap";
    log(
      `${player.name} placed a trap at (${targetPos[0]},${targetPos[1]},T${targetPos[2]})`
    );
  } else if (tool === "gun") {
    const dx = Math.sign(targetPos[0] - player.pos[0]);
    const dy = Math.sign(targetPos[1] - player.pos[1]);
    if (dx !== 0 && dy !== 0) {
      log(`Gun requires straight line of sight`);
      return;
    }

    const targetCell = game.timeSpace[targetPos[2]][targetPos[1]][targetPos[0]];
    if (targetCell && targetCell.startsWith("player-")) {
      const targetId = parseInt(targetCell.split("-")[1]);
      const target = game.players[targetId];
      target.alive = false;
      game.timeSpace[targetPos[2]][targetPos[1]][targetPos[0]] = null;
      log(`${player.name} shot ${target.name}!`);
    }
  }
}

function checkParadoxes() {
  game.players.forEach((player) => {
    if (!player.alive && player.history.length > 0) {
      const futureHistory = player.history.filter((pos) => pos[2] > game.turn);
      if (futureHistory.length > 0) {
        log(`Paradox detected! ${player.name} eliminated from timeline`);
        player.history.forEach((pos) => {
          if (
            game.timeSpace[pos[2]][pos[1]][pos[0]] === `player-${player.id}`
          ) {
            game.timeSpace[pos[2]][pos[1]][pos[0]] = null;
          }
        });
      }
    }
  });
}

function endTurn() {
  do {
    game.currentPlayer = (game.currentPlayer + 1) % PLAYER_COUNT;
  } while (
    !game.players[game.currentPlayer].alive &&
    game.players.some((p) => p.alive)
  );

  game.turn++;

  const alivePlayers = game.players.filter((p) => p.alive);
  if (alivePlayers.length <= 1) {
    game.winner = alivePlayers[0] || null;
  }

  render();
}

function render() {
  renderBoard();
  renderPlayers();

  const winnerEl = document.getElementById("winner")!;
  if (game.winner) {
    winnerEl.textContent = game.winner ? `${game.winner.name} Wins!` : "Draw!";
    winnerEl.style.display = "block";
  }
}

function renderBoard() {
  const boardEl = document.getElementById("board")!;
  boardEl.innerHTML = "";

  for (let t = 0; t < TIME_LAYERS; t++) {
    const layerEl = document.createElement("div");
    layerEl.className = "time-layer";

    const labelEl = document.createElement("div");
    labelEl.className = "time-label";
    labelEl.textContent = `Time Layer ${t} ${
      t === 0 ? "(Past)" : t === 1 ? "(Present)" : "(Future)"
    }`;
    layerEl.appendChild(labelEl);

    const gridEl = document.createElement("div");
    gridEl.className = "grid";

    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const cellEl = document.createElement("div");
        cellEl.className = "cell";

        const content = game.timeSpace[t][y][x];
        if (content) {
          cellEl.classList.add(content);
          if (content.startsWith("player-"))
            cellEl.textContent = `P${parseInt(content.split("-")[1]) + 1}`;
          else if (content === "trap") cellEl.textContent = "⚠";
          else if (content === "gun") cellEl.textContent = "🔫";
        }

        const coordEl = document.createElement("div");
        coordEl.className = "coord";
        coordEl.textContent = `${x},${y}`;
        cellEl.appendChild(coordEl);

        cellEl.onclick = () => {
          if (game.selectedTool) {
            applyTool(game.selectedTool, [x, y, t]);
            game.selectedTool = null;
            (document.getElementById("toolSelect") as HTMLSelectElement).value =
              "";
            render();
          }
        };

        gridEl.appendChild(cellEl);
      }
    }

    layerEl.appendChild(gridEl);
    boardEl.appendChild(layerEl);
  }
}

function renderPlayers() {
  const playersEl = document.getElementById("players")!;
  playersEl.innerHTML = "";

  game.players.forEach((player, i) => {
    const playerEl = document.createElement("div");
    playerEl.className = "player-info";
    if (i === game.currentPlayer && player.alive)
      playerEl.classList.add("current");
    if (!player.alive) playerEl.classList.add("dead");

    playerEl.innerHTML = `
      <div><strong>${player.name}</strong> ${player.alive ? "✓" : "✗"}</div>
      <div>Position: (${player.pos[0]},${player.pos[1]},T${player.pos[2]})</div>
      <div>Times: [${player.unlockedTimes.join(", ")}]</div>
    `;
    playersEl.appendChild(playerEl);
  });
}

// Tool selection
(document.getElementById("toolSelect") as HTMLSelectElement).onchange = (e) => {
  game.selectedTool = (e.target as HTMLSelectElement).value || null;
};

// Movement buttons
document.getElementById("moveWest")!.onclick = () => move(-1, 0, 0);
document.getElementById("moveEast")!.onclick = () => move(1, 0, 0);
document.getElementById("moveNorth")!.onclick = () => move(0, -1, 0);
document.getElementById("moveSouth")!.onclick = () => move(0, 1, 0);
document.getElementById("movePast")!.onclick = () => move(0, 0, -1);
document.getElementById("moveFuture")!.onclick = () => move(0, 0, 1);
document.getElementById("endTurnBtn")!.onclick = endTurn;

// Initialize
render();
log("Game started! Player 1's turn");
