import { Player as IPlayer, Tool, Coordinate as ICoordinate } from "./types.ts";
import { Coordinate } from "./Coordinate.ts";
import { Tool as GameTool } from "./tool.ts";

export class Player implements IPlayer {
  id: number;
  name: string;
  color: string;
  history: Coordinate[];
  alive: boolean;
  currentPosition: Coordinate | null;
  tools: Tool[];
  activeToolIndex: number;

  constructor(id: number, name: string, color: string) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.history = [];
    this.alive = true;
    this.currentPosition = null;
    this.tools = [new GameTool("trap", false)];
    this.activeToolIndex = 0;
  }

  getCurrentPosition(): Coordinate | null {
    return this.history.length > 0
      ? this.history[this.history.length - 1] ?? null
      : null;
  }

  addMove(coordinate: ICoordinate): void {
    const coord =
      coordinate instanceof Coordinate
        ? coordinate
        : new Coordinate(
            coordinate.pos[0],
            coordinate.pos[1],
            coordinate.pos[2]
          );
    this.history.push(coord.clone());
    this.currentPosition = coord.clone();
  }

  getActiveTool(): Tool | null {
    return this.tools[this.activeToolIndex] || null;
  }

  useTool(coordinate: ICoordinate): boolean {
    const tool = this.getActiveTool();
    if (tool && !tool.triggered) {
      tool.attach(coordinate);
      return true;
    }
    return false;
  }
}
