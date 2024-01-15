import { getIntersection, getRandomColor } from "../math/utils";
import { LocalStoragePolygon } from "../models/worldData";
import Point from "./point";
import Segment from "./segment";

export default class Polygon {
  public points: Point[];
  public segments: Segment[] = [];

  constructor(points: Point[]) {
    this.points = points;
    this.#generateSegments();
  }

  /**
   * Breaks the given polygons at their intersection points and updates their segments accordingly.
   * @param poly1 The first polygon.
   * @param poly2 The second polygon.
   */
  public static break(poly1: Polygon, poly2: Polygon) {
    const segments1 = poly1.segments;
    const segments2 = poly2.segments;
    for (let i = 0; i < segments1.length; i++) {
      for (let j = 0; j < segments2.length; j++) {
        const int = getIntersection(segments1[i].p1, segments1[i].p2, segments2[j].p1, segments2[j].p2);
        if (int && int.offset != 1 && int.offset != 0) {
          const point = new Point(int.x, int.y);
          let aux = segments1[i].p2;
          segments1[i].p2 = point;
          segments1.splice(i + 1, 0, new Segment(point, aux));
          aux = segments2[j].p2;
          segments2[j].p2 = point;
          segments2.splice(j + 1, 0, new Segment(point, aux));
        }
      }
    }
  }

  /**
   * Checks if a point is contained within a polygon.
   * @param poly The polygon to check.
   * @param point The point to check.
   * @returns True if the point is contained within the polygon, false otherwise.
   */
  public static containsPoint(poly: Polygon, point: Point): boolean {
    const outerPoint = new Point(-1000, -1000);
    let intersectionsCount = 0;
    for (const segment of poly.segments) {
      const intersection = getIntersection(point, outerPoint, segment.p1, segment.p2);
      if (intersection) {
        intersectionsCount++;
      }
    }
    return intersectionsCount % 2 == 1;
  }

  /**
   * Checks if a polygon contains a given segment.
   * @param poly The polygon to check.
   * @param segment The segment to check.
   * @returns True if the polygon contains the segment, false otherwise.
   */
  public static containsSegment(poly: Polygon, segment: Segment): boolean {
    const midpoint = segment.midpoint();
    return Polygon.containsPoint(poly, midpoint);
  }

  /**
   * Calculates the minimum distance from a polygon to a point.
   *
   * @param poly The polygon to calculate the distance from.
   * @param point The point to calculate the distance to.
   * @returns The minimum distance from the polygon to the point.
   */
  public static distanceToPoint(poly: Polygon, point: Point): number {
    return Math.min(...poly.segments.map((segment) => Segment.distanceToPoint(segment, point)));
  }

  /**
   * Calculates the minimum distance between two polygons.
   * @param poly1 The first polygon.
   * @param poly2 The second polygon.
   * @returns The minimum distance between the two polygons.
   */
  public static distanceToPoly(poly1: Polygon, poly2: Polygon): number {
    return Math.min(...poly1.points.map((point) => Polygon.distanceToPoint(poly2, point)));
  }

  /**
   * Checks if two polygons intersect.
   * @param poly1 The first polygon.
   * @param poly2 The second polygon.
   * @returns True if the polygons intersect, false otherwise.
   */
  public static intersection(poly1: Polygon, poly2: Polygon): boolean {
    for (const s1 of poly1.segments) {
      for (const s2 of poly2.segments) {
        const int = getIntersection(s1.p1, s1.p2, s2.p1, s2.p2);
        if (int && int.offset != 1 && int.offset != 0) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Breaks the given array of polygons into smaller polygons by breaking each pair of polygons.
   * @param polygons - The array of polygons to be broken.
   */
  public static multiBreak(polygons: Polygon[]) {
    for (let i = 0; i < polygons.length; i++) {
      for (let j = i + 1; j < polygons.length; j++) {
        Polygon.break(polygons[i], polygons[j]);
      }
    }
  }

  /**
   * Computes the union of multiple polygons.
   *
   * @param polygons - The polygons to compute the union for.
   * @returns An array of segments representing the union of the polygons.
   */
  public static union(polygons: Polygon[]): Segment[] {
    Polygon.multiBreak(polygons);
    const keptSegments: Segment[] = [];
    polygons.forEach((polygon) =>
      keptSegments.push(
        ...polygon.segments.filter(
          // filter out segments that are contained by another polygon, but not the current one
          (segment) => !polygons.filter((p) => p !== polygon).some((p1) => p1.containsSegment(segment))
        )
      )
    );
    return keptSegments;
  }

  /**
   * Checks if a given point is contained within the polygon.
   * @param point - The point to check.
   * @returns True if the point is contained within the polygon, false otherwise.
   */
  public containsPoint(point: Point) {
    const outerPoint = new Point(-1000, -1000);
    let intersectionsCount = 0;
    for (const segment of this.segments) {
      const intersection = getIntersection(point, outerPoint, segment.p1, segment.p2);
      if (intersection) {
        intersectionsCount++;
      }
    }
    return intersectionsCount % 2 == 1;
  }

  /**
   * Checks if the polygon contains a given segment.
   *
   * @param segment - The segment to check.
   * @returns True if the polygon contains the segment, false otherwise.
   */
  public containsSegment(segment: Segment) {
    const midpoint = segment.midpoint();
    return this.containsPoint(midpoint);
  }

  /**
   * Draws the polygon on the canvas.
   *
   * @param ctx - The canvas rendering context.
   * @param options - The options for drawing the polygon.
   * @param options.stroke - The stroke color of the polygon. Default is "blue".
   * @param options.fill - The fill color of the polygon. Default is "rgba(0,0,255,0.3)".
   * @param options.lineWidth - The line width of the polygon. Default is 2.
   * @param options.join - The line join style of the polygon. Default is "miter".
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    {
      stroke = "blue",
      fill = "rgba(0,0,255,0.3)",
      lineWidth = 2,
      join = "miter",
    }: { stroke?: string; fill?: string; lineWidth?: number; join?: CanvasLineJoin } = {}
  ) {
    if (this.points.length < 2) {
      return;
    }
    ctx.beginPath();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = join;
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  /**
   * Generates the segments of the polygon based on its points.
   */
  #generateSegments() {
    this.segments.length = 0;
    for (let i = 0; i < this.points.length; i++) {
      this.segments.push(new Segment(this.points[i], this.points[(i + 1) % this.points.length]));
    }
  }

  static load(data: LocalStoragePolygon): Polygon {
    const points = data.points.map((point) => Point.load(point));
    return new Polygon(points);
  }
}
