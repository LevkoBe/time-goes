import { Coordinate as ICoordinate, Movement } from "./types.ts";

export class Coordinate implements ICoordinate {
  pos: [number, number, number];

  constructor(t: number, x: number, y: number) {
    this.pos = [t, x, y];
  }

  add(move: Movement): this {
    this.pos[0] += move[0];
    this.pos[1] += move[1];
    this.pos[2] += move[2];
    return this;
  }

  clone(): Coordinate {
    return new Coordinate(this.pos[0], this.pos[1], this.pos[2]);
  }

  equals(other: ICoordinate): boolean {
    return (
      this.pos[0] === other.pos[0] &&
      this.pos[1] === other.pos[1] &&
      this.pos[2] === other.pos[2]
    );
  }

  toString(): string {
    return `[${this.pos.join(", ")}]`;
  }
}
