import { LocalStorageSegment } from "../models/worldData";
import Point from "./point";

interface PointProjection {
  offset: number;
  point: Point;
  valid: boolean;
}

interface SegmentDrawOptions {
  cap?: CanvasLineCap;
  color?: string;
  dash?: number[];
  width?: number;
}

export default class Segment {
  public p1: Point;
  public p2: Point;

  constructor(p1: Point, p2: Point) {
    this.p1 = p1;
    this.p2 = p2;
  }

  /**
   * Calculates the distance between a segment and a point.
   * if the point is outside the segment, the distance to
   * the closest endpoint is returned.
   * @param segment - The segment to calculate the distance from.
   * @param point - The point to calculate the distance to.
   * @returns The distance between the segment and the point.
   */
  public static distanceToPoint(segment: Segment, point: Point): number {
    const projection = Segment.projectPointOnto(segment, point);
    if (projection.offset < 0 || projection.offset > 1) {
      return Math.min(Point.getDistance(segment.p1, point), Point.getDistance(segment.p2, point));
    }
    return Point.getDistance(projection.point, point);
  }

  /**
   * Returns the nearest segment to a given point from an array of segments.
   * @param point - The point to find the nearest segment to.
   * @param segments - An array of segments to search from.
   * @param maxDistance - The maximum distance allowed for a segment to be considered nearest.
   * @returns The nearest segment to the given point, or null if no segment is found within the maximum distance.
   */
  public static getNearestSegment(point: Point, segments: Segment[], maxDistance: number): Segment | null {
    let nearestSegment: Segment | null = null;
    let nearestDistance = maxDistance;
    for (const segment of segments) {
      const distance = Segment.distanceToPoint(segment, point);
      if (distance < nearestDistance) {
        nearestSegment = segment;
        nearestDistance = distance;
      }
    }
    return nearestSegment;
  }

  /**
   * Loads a Segment object from LocalStorageSegment data.
   * @param data - The LocalStorageSegment data to load from.
   * @returns A new Segment object.
   */
  public static load(data: LocalStorageSegment): Segment {
    return new Segment(Point.load(data.p1), Point.load(data.p2));
  }

  /**
   * Projects a point onto a segment and returns the projection.
   * @param segment - The segment onto which the point will be projected.
   * @param point - The point to be projected onto the segment.
   * @returns The projection of the point onto the segment.
   */
  public static projectPointOnto(segment: Segment, point: Point): PointProjection {
    const alpha = segment.p1;
    const beta = Point.subVector(segment.p2, segment.p1);
    const a = Point.dotProduct(point, beta) - Point.dotProduct(alpha, beta);
    const b = Point.getLength(beta) * Point.getLength(beta);
    if (b === 0) {
      return { point: segment.p1, offset: 0, valid: false };
    }
    const l = a / b;
    const r = Point.addVector(alpha, Point.scaleVector(beta, l));
    const projection = {
      point: r,
      offset: l,
      valid: true,
    };
    return projection;
  }

  /**
   * Calculates the direction vector of the segment.
   * @returns The direction vector of the segment.
   */
  public directionVector(): Point {
    const subVector = Point.subVector(this.p2, this.p1);
    const length = Point.getDistance(this.p1, this.p2);
    return Point.scaleVector(subVector, 1 / length);
  }

  /**
   * Draws the segment on the canvas.
   *
   * @param ctx - The canvas rendering context.
   * @param width - The width of the line (default: 2).
   * @param color - The color of the line (default: "black").
   */
  public draw(ctx: CanvasRenderingContext2D, { width = 2, color = "black", dash = [], cap = "butt" }: SegmentDrawOptions = {}) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.setLineDash(dash);
    ctx.lineCap = cap;
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /**
   * Checks if this segment is equal to the given segment.
   *
   * @param seg - The segment to compare with.
   * @returns True if the segments are equal, false otherwise.
   */
  public equals(seg: Segment) {
    return this.includes(seg.p1) && this.includes(seg.p2);
  }

  /**
   * Checks if the segment includes a given point.
   * @param {Point} point - The point to check.
   * @returns {boolean} - True if the segment includes the point, false otherwise.
   */
  public includes(point: Point) {
    return this.p1.equals(point) || this.p2.equals(point);
  }

  /**
   * Calculates the length of the segment.
   * @returns The length of the segment.
   */
  public length(): number {
    return Point.getDistance(this.p1, this.p2);
  }

  /**
   * Returns the midpoint of the segment.
   * @returns {Point} The midpoint of the segment.
   */
  public midpoint(): Point {
    return new Point((this.p1.x + this.p2.x) / 2, (this.p1.y + this.p2.y) / 2);
  }
}
