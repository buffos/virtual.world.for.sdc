import Envelope from "../primitives/envelope";
import Point from "../primitives/point";
import Polygon from "../primitives/polygon";
import Segment from "../primitives/segment";
import { MarkingType } from "./markingTypes";

export default class Marking {
  public center: Point;
  public direction: Point;
  public height: number;
  public poly: Polygon;
  public support: Segment;
  public type: MarkingType = "undefined";
  public width: number;

  constructor(center: Point, direction: Point, width: number, height: number) {
    this.center = center;
    this.direction = direction;
    this.width = width;
    this.height = height;

    this.support = new Segment(
      Point.translate(this.center, Point.angle(this.direction), this.height / 2),
      Point.translate(this.center, Point.angle(this.direction), -this.height / 2)
    );
    this.poly = new Envelope(this.support, this.width, 0).polygon;
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    this.poly.draw(ctx);
  }
}
