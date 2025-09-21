import {
  Tool as ITool,
  Target,
  Player,
  Coordinate as ICoordinate,
} from "./types.ts";
import { Coordinate } from "./Coordinate.ts";

export class Tool implements ITool {
  toolType: string;
  visible: boolean;
  attachment: Target | null;
  history: { toolAction: "apply" | "attach"; target: Target }[];
  triggered: boolean;

  constructor(toolType: string = "trap", visible: boolean = false) {
    this.toolType = toolType;
    this.visible = visible;
    this.attachment = null;
    this.history = [];
    this.triggered = false;
  }

  apply(target: Target): void {
    if (this.toolType === "trap" && this.isPlayer(target)) {
      console.log(`Trap triggered! ${target.name} eliminated by trap.`);
      target.alive = false;
      this.attachment = target;
      this.triggered = true;
      this.history.push({
        toolAction: "apply",
        target: target,
      });
    }
    // todo: check if anyone gets trapped in future right at the moment of planting the trap
  }

  unapply(target: Target): void {
    // todo: resurrect everyone and clean history for all future application
    console.log(`Unapplying tool effect on ${target}`);
  }

  attach(coordinate: ICoordinate): void {
    const coord =
      coordinate instanceof Coordinate
        ? coordinate
        : new Coordinate(
            coordinate.pos[0],
            coordinate.pos[1],
            coordinate.pos[2]
          );
    this.attachment = coord.clone();
    this.history.push({
      toolAction: "attach",
      target: coord.clone(),
    });
    console.log(`Trap placed at ${coord.toString()}`);
  }

  isTriggeredAt(coordinate: ICoordinate, currentTime: number): boolean {
    if (this.triggered) return false;

    const placementRecord = this.history.find(
      (record) =>
        record.toolAction === "attach" &&
        this.isCoordinate(record.target) &&
        record.target.pos[1] === coordinate.pos[1] &&
        record.target.pos[2] === coordinate.pos[2] &&
        record.target.pos[0] <= currentTime
    );

    return !!placementRecord;
  }

  private isPlayer(target: Target): target is Player {
    return (target as Player).name !== undefined;
  }

  private isCoordinate(target: Target): target is ICoordinate {
    return (target as ICoordinate).pos !== undefined;
  }
}
