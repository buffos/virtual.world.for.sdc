import { lerp } from "../math/utils";
import { LocalStoragePoint } from "../models/worldData";

interface PointDrawOptions {
  cap?: CanvasLineCap;
  color?: string;
  fill?: boolean;
  outline?: boolean;
  size?: number;
}

export default class Point {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public static addVector(p1: Point, p2: Point) {
    return new Point(p1.x + p2.x, p1.y + p2.y);
  }

  public static angle(p: Point) {
    return Math.atan2(p.y, p.x);
  }

  /**
   * Calculates the average point from an array of points.
   *
   * @param points - The array of points.
   * @returns The average point.
   */
  public static average(points: Point[]): Point {
    const sum = points.reduce((acc, point) => Point.addVector(acc, point), new Point(0, 0));
    return Point.scaleVector(sum, 1 / points.length);
  }

  public static dotProduct(v1: Point, v2: Point): number {
    return v1.x * v2.x + v1.y * v2.y;
  }

  /**
   * Checks if two points are equal.
   * @param point1 The first point.
   * @param point2 The second point.
   * @returns True if the points are equal, false otherwise.
   */
  public static equals(point1: Point, point2: Point) {
    return point1.x === point2.x && point1.y === point2.y;
  }

  /**
   * Calculates the Euclidean distance between two points.
   * @param p1 The first point.
   * @param p2 The second point.
   * @returns The distance between the two points.
   */
  public static getDistance(p1: Point, p2: Point): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public static getFake3dPoint(point: Point, viewPoint: Point, height: number) {
    const direction = Point.normalize(Point.subVector(point, viewPoint)); // get the direction vector from the view point to the point
    const distance = Point.getDistance(point, viewPoint); // get the distance between the two points
    const scaler = Math.atan(distance / 300) / (Math.PI / 2); // at pi/2 the scaler is 1, at 0 the scaler is 0
    return Point.addVector(point, Point.scaleVector(direction, height * scaler));
  }

  public static getLength(p: Point): number {
    return Math.sqrt(p.x * p.x + p.y * p.y);
  }

  /**
   * Returns the nearest point to a given location from an array of points.
   * @param loc The location from which to find the nearest point.
   * @param points An array of points to search from.
   * @param threshold The maximum distance allowed for a point to be considered nearest. Defaults to Number.MAX_SAFE_INTEGER.
   * @returns The nearest point to the given location, or null if no points are provided.
   */
  public static getNearestPoint(loc: Point, points: Point[], threshold: number = Number.MAX_SAFE_INTEGER): Point | null {
    let minDist = threshold;
    let nearest = null;
    for (const point of points) {
      const dist = Point.getDistance(loc, point);
      if (dist < minDist) {
        minDist = dist;
        nearest = point;
      }
    }
    return nearest;
  }

  /**
   * Performs linear interpolation between two points.
   * @param v1 The starting point.
   * @param v2 The ending point.
   * @param t The interpolation factor.
   * @returns The interpolated point.
   */
  public static lerp(v1: Point, v2: Point, t: number): Point {
    return new Point(lerp(v1.x, v2.x, t), lerp(v1.y, v2.y, t));
  }

  /**
   * Loads a Point object from LocalStoragePoint data.
   * @param data The LocalStoragePoint data to load from.
   * @returns A new Point object.
   */
  public static load(data: LocalStoragePoint): Point {
    return new Point(data.x, data.y);
  }

  /**
   * Normalizes a given point by dividing its coordinates by its length.
   * If the length of the point is 0, returns a new Point with coordinates (0, 0).
   * @param point - The point to be normalized.
   * @returns A new Point object with normalized coordinates.
   */
  public static normalize(point: Point): Point {
    const length = Point.getLength(point);
    if (length === 0) {
      return new Point(0, 0);
    }
    return new Point(point.x / length, point.y / length);
  }

  public static rotate(p: Point, angle: number) {
    return new Point(p.x * Math.cos(angle) - p.y * Math.sin(angle), p.x * Math.sin(angle) + p.y * Math.cos(angle));
  }

  public static scaleVector(p: Point, scale: number) {
    return new Point(p.x * scale, p.y * scale);
  }

  public static subVector(p1: Point, p2: Point) {
    return new Point(p1.x - p2.x, p1.y - p2.y);
  }

  public static translate(p: Point, angle: number, distance: number) {
    return new Point(p.x + distance * Math.cos(angle), p.y + distance * Math.sin(angle));
  }

  /**
   * Draws a point on the canvas.
   * @param ctx - The canvas rendering context.
   * @param size - The size of the point (default: 18).
   * @param color - The color of the point (default: "black").
   */
  public draw(ctx: CanvasRenderingContext2D, { size = 18, color = "black", outline = false, fill = false, cap = "butt" }: PointDrawOptions = {}) {
    const rad = size / 2;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(this.x, this.y, rad, 0, 2 * Math.PI);
    ctx.lineCap = cap;
    ctx.fill();
    if (outline) {
      ctx.beginPath();
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 2;
      ctx.arc(this.x, this.y, rad * 0.6, 0, 2 * Math.PI);
      ctx.stroke();
    }
    if (fill) {
      ctx.beginPath();
      ctx.fillStyle = "yellow";
      ctx.arc(this.x, this.y, rad * 0.4, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  /**
   * Checks if the current point is equal to the given point.
   * @param point The point to compare with.
   * @returns True if the points are equal, false otherwise.
   */
  public equals(point: Point) {
    return this.x === point.x && this.y === point.y;
  }
}
