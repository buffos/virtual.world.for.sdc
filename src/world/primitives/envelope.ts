import { LocalStorageEnvelope } from "../../models/worldData";
import Point from "./point";
import Polygon from "./polygon";
import Segment from "./segment";

export default class Envelope {
  public polygon!: Polygon;
  public skeleton!: Segment;

  constructor(skeleton: Segment, width: number, roundness: number = 1, polygon?: Polygon) {
    this.skeleton = skeleton;
    if (!polygon) {
      this.polygon = this.#generatePolygon(width, roundness);
      return;
    }
    this.polygon = polygon;
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    { stroke = "blue", fill = "rgba(0,0,255,0.3)", lineWidth = 2 }: { stroke?: string; fill?: string; lineWidth?: number } = {}
  ) {
    this.polygon.draw(ctx, { stroke, fill, lineWidth });
  }

  #generatePolygon(width: number, roundness: number): Polygon {
    const { p1, p2 } = this.skeleton;
    const radius = width / 2;
    const alpha = Point.angle(Point.subVector(p1, p2));
    const alpha_cw = alpha + Math.PI / 2;
    const alpha_ccw = alpha - Math.PI / 2;

    const points: Point[] = [];

    const step = Math.PI / Math.max(1, roundness);
    const epsilon = step / 2; // since those are floating point numbers, we need to add a small epsilon to the end condition
    for (let i = alpha_ccw; i < alpha_cw + epsilon; i += step) {
      points.push(Point.translate(p1, i, radius));
    }
    for (let i = alpha_ccw; i < alpha_cw + epsilon; i += step) {
      points.push(Point.translate(p2, Math.PI + i, radius));
    }

    return new Polygon(points);
  }

  static load(data: LocalStorageEnvelope): Envelope {
    const skeleton = Segment.load(data.skeleton);
    const polygon = Polygon.load(data.polygon);
    return new Envelope(skeleton, 0, 0, polygon);
  }
}
