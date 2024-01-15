import Point from "../primitives/point";
import Segment from "../primitives/segment";
import Marking from "./marking";
import { MarkingType } from "./markingTypes";

export default class Cross extends Marking {
  public borders: Segment[];
  public type: MarkingType = "cross";

  constructor(center: Point, direction: Point, width: number, height: number) {
    super(center, direction, width, height);
    this.borders = [this.poly.segments[0], this.poly.segments[2]];
  }

  public draw(ctx: CanvasRenderingContext2D) {
    const perpendicular = Point.rotate(this.direction, Math.PI / 2);
    const line = new Segment(
      Point.addVector(this.center, Point.scaleVector(perpendicular, this.width / 2)),
      Point.addVector(this.center, Point.scaleVector(perpendicular, -this.width / 2))
    );
    line.draw(ctx, { color: "white", width: this.height, dash: [11, 11] });
  }
}
