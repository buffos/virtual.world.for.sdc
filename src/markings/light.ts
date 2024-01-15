import Point from "../primitives/point";
import Segment from "../primitives/segment";
import Marking from "./marking";
import { MarkingType } from "./markingTypes";

type LightState = "green" | "yellow" | "red";

export default class Light extends Marking {
  public state: LightState = "green";
  public border: Segment;
  public type: MarkingType = "light";

  constructor(center: Point, direction: Point, width: number, height: number) {
    super(center, direction, width, height);
    this.border = this.poly.segments[0];
  }

  public draw(ctx: CanvasRenderingContext2D) {
    const perpendicular = Point.rotate(this.direction, Math.PI / 2);
    const line = new Segment(
      Point.addVector(this.center, Point.scaleVector(perpendicular, this.width / 2)),
      Point.addVector(this.center, Point.scaleVector(perpendicular, -this.width / 2))
    );
    const green = Point.lerp(line.p1, line.p2, 0.2);
    const yellow = Point.lerp(line.p1, line.p2, 0.5);
    const red = Point.lerp(line.p1, line.p2, 0.8);
    new Segment(red, green).draw(ctx, { width: this.height, cap: "round" });
    green.draw(ctx, { size: this.height * 0.6, color: "#060" });
    yellow.draw(ctx, { size: this.height * 0.6, color: "#660" });
    red.draw(ctx, { size: this.height * 0.6, color: "#600" });

    switch (this.state) {
      case "green":
        green.draw(ctx, { size: this.height * 0.6, color: "#0f0", outline: true });
        break;
      case "yellow":
        yellow.draw(ctx, { size: this.height * 0.6, color: "#ff0", outline: true });
        break;
      case "red":
        red.draw(ctx, { size: this.height * 0.6, color: "#f00", outline: true });
        break;
    }
  }
}
