import Point from "../primitives/point";
import Segment from "../primitives/segment";
import Marking from "./marking";
import { MarkingType } from "./markingTypes";

export default class Stop extends Marking {
  public border: Segment;
  public type: MarkingType = "stop";

  constructor(center: Point, direction: Point, width: number, height: number) {
    super(center, direction, width, height);
    this.border = this.poly.segments[2];
  }

  public draw(ctx: CanvasRenderingContext2D) {
    this.border.draw(ctx, { color: "white", width: 5 });
    ctx.save();
    ctx.translate(this.center.x, this.center.y); // move to the center of the lane
    ctx.rotate(Point.angle(this.direction) - Math.PI / 2); // align the text with the segments direction
    ctx.scale(1, 3);
    ctx.beginPath();
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = `bold ${this.height * 0.3}px ui-system`;
    ctx.fillText("STOP", 0, 1);
    ctx.restore();
  }
}
