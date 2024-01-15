import Marking from "./marking";
import { MarkingType } from "./markingTypes";

export default class Target extends Marking {
  public type: MarkingType = "target";
  public draw(ctx: CanvasRenderingContext2D) {
    this.center.draw(ctx, { color: "red", size: 30 });
    this.center.draw(ctx, { color: "white", size: 20 });
    this.center.draw(ctx, { color: "red", size: 10 });
  }
}
