import { LocalStorageGraph } from "../models/worldData";
import Point from "../world/primitives/point";
import Segment from "../world/primitives/segment";

export default class Graph {
  public points: Point[];
  public segments: Segment[];

  constructor(points: Point[] = [], segments: Segment[] = []) {
    this.points = points;
    this.segments = segments;
  }

  /**
   * Loads a graph from a string representation.
   * @param graph - The string representation of the graph.
   * @returns The loaded graph.
   */
  public static load(graph: LocalStorageGraph): Graph {
    const { points, segments } = graph;
    let graphPoints = points.map((point) => new Point(point.x, point.y));
    let graphSegments = segments.map(
      (segment) =>
        new Segment(
          graphPoints.find((p: Point) => p.equals(segment.p1 as Point)) as Point,
          graphPoints.find((p: Point) => p.equals(segment.p2 as Point)) as Point
        )
    );
    return new Graph(graphPoints, graphSegments);
  }

  /**
   * Adds a point to the graph.
   * @param point The point to be added.
   */
  public addPoint(point: Point) {
    this.points.push(point);
  }

  /**
   * Adds a segment to the graph.
   *
   * @param segment - The segment to be added.
   */
  public addSegment(segment: Segment) {
    this.segments.push(segment);
  }

  /**
   * Checks if the graph contains a specific point.
   * @param point The point to check.
   * @returns True if the graph contains the point, false otherwise.
   */
  public containsPoint(point: Point) {
    return this.points.includes(point);
  }

  /**
   * Checks if the graph contains a specific segment.
   * @param segment - The segment to check for.
   * @returns True if the graph contains the segment, false otherwise.
   */
  public containsSegment(segment: Segment) {
    return this.segments.includes(segment);
  }

  /**
   * Clears the points and segments arrays, disposing of any resources.
   */
  public dispose() {
    this.points.length = 0;
    this.segments.length = 0;
  }

  /**
   * Draws the graph on the canvas.
   *
   * @param ctx The canvas rendering context.
   */
  public draw(ctx: CanvasRenderingContext2D) {
    for (const segment of this.segments) {
      segment.draw(ctx);
    }

    for (const point of this.points) {
      point.draw(ctx);
    }
  }

  /**
   * Returns an array of segments that include the specified point.
   * @param point The point to check for inclusion in segments.
   * @returns An array of segments that include the specified point.
   */
  public getSegmentsWithPoint(point: Point) {
    return this.segments.filter((segment) => {
      return segment.includes(point);
    });
  }

  /**
   * Returns a string representation of the graph object.
   * @returns {string} The string representation of the graph object.
   */
  public hash(): string {
    return JSON.stringify(this);
  }

  /**
   * Removes a point from the graph.
   * @param point - The point to be removed.
   */
  public removePoint(point: Point) {
    const index = this.points.indexOf(point); // first check if the point is in the graph
    if (index !== -1) {
      this.getSegmentsWithPoint(point).forEach((segment) => {
        this.removeSegment(segment);
      });
      this.points.splice(index, 1);
    }
  }

  /**
   * Removes a segment from the graph.
   * @param segment - The segment to be removed.
   */
  public removeSegment(segment: Segment) {
    const index = this.segments.indexOf(segment);
    if (index !== -1) {
      this.segments.splice(index, 1);
    }
  }

  /**
   * Tries to add a point to the graph.
   * @param point The point to be added.
   * @returns Returns true if the point was added successfully, false otherwise.
   */
  public tryAddPoint(point: Point): boolean {
    if (!this.containsPoint(point)) {
      this.addPoint(point);
      return true;
    }
    return false;
  }

  /**
   * Tries to add a segment to the graph.
   *
   * @param segment - The segment to be added.
   * @returns True if the segment was added successfully, false otherwise.
   */
  public tryAddSegment(segment: Segment): boolean {
    if (!this.containsSegment(segment) && !segment.p1.equals(segment.p2)) {
      this.addSegment(segment);
      return true;
    }
    return false;
  }
}
