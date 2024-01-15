import Point from "../primitives/point";
import Marking from "./marking";
import { MarkingType } from "./markingTypes";

export default class Start extends Marking {
  img: HTMLImageElement;
  public type: MarkingType = "start";

  constructor(center: Point, direction: Point, width: number, height: number) {
    super(center, direction, width, height);
    this.img = new Image();
    this.img.src = "/src/car.png";
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.center.x, this.center.y); // move to the center of the lane
    ctx.rotate(Point.angle(this.direction) - Math.PI / 2); // align the text with the segments direction
    ctx.drawImage(this.img, -this.img.width / 2, -this.img.height / 2);
    ctx.restore();
  }
}
