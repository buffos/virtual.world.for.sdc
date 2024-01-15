import Point from "../primitives/point";
import Segment from "../primitives/segment";
import Marking from "./marking";
import { MarkingType } from "./markingTypes";

export default class Park extends Marking {
  public borders: Segment[];
  public type: MarkingType = "park";

  constructor(center: Point, direction: Point, width: number, height: number) {
    super(center, direction, width, height);
    this.borders = [this.poly.segments[0], this.poly.segments[2]];
  }

  public draw(ctx: CanvasRenderingContext2D) {
    this.borders[0].draw(ctx, { color: "white", width: 5 });
    this.borders[1].draw(ctx, { color: "white", width: 5 });
    ctx.save();
    ctx.translate(this.center.x, this.center.y); // move to the center of the lane
    ctx.rotate(Point.angle(this.direction)); // align the text with the segments direction
    ctx.beginPath();
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = `bold ${this.height * 0.9}px ui-system`;
    ctx.fillText("P", 0, 3);
    ctx.restore();
  }
}
