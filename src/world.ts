import ControlCenter from "./controlCenter";
import Building from "./items/building";
import Tree from "./items/tree";
import Light from "./markings/light";
import Marking from "./markings/marking";
import { loadMarking } from "./markings/markingLoader";
import Graph from "./math/graph";
import { lerp } from "./math/utils";
import { WorldData } from "./models/worldData";
import Envelope from "./primitives/envelope";
import Point from "./primitives/point";
import Polygon from "./primitives/polygon";
import Segment from "./primitives/segment";

interface WorldOptions {
  buildingMinLength?: number;
  buildingWidth?: number;
  roadWidth?: number;
  roundness?: number;
  spacing?: number;
  treeSize?: number;
}

export default class World {
  public buildingMinLength: number;
  public buildingWidth: number;
  public buildings: Building[] = [];
  public controlCenters: ControlCenter[] = [];
  public envelopes: Envelope[] = [];
  public graph: Graph;
  public laneGuides: Segment[] = [];
  public markings: Marking[] = [];
  public offset: Point = new Point(0, 0);
  public roadBorders: Segment[] = [];
  public roadWidth: number;
  public roundness: number;
  public spacing: number;
  public treeSize: number;
  public trees: Tree[] = [];
  public zoom: number = 1;

  constructor(graph: Graph, { roadWidth = 100, roundness = 3, buildingWidth = 150, buildingMinLength = 150, spacing = 50, treeSize = 100 }: WorldOptions = {}) {
    this.graph = graph;
    this.roadWidth = roadWidth;
    this.roundness = roundness;
    this.buildingWidth = buildingWidth;
    this.buildingMinLength = buildingMinLength;
    this.spacing = spacing;
    this.treeSize = treeSize;
    this.generate();
  }

  public static load(name: string = "world"): World {
    const info = window.localStorage.getItem(name);
    const world = new World(new Graph([], []), { roadWidth: 100, roundness: 5 });
    if (!info) {
      return world;
    }
    const worldData: WorldData = JSON.parse(info);
    world.graph = Graph.load(worldData.graph);
    world.buildingMinLength = worldData.buildingMinLength;
    world.buildingWidth = worldData.buildingWidth;
    world.roadWidth = worldData.roadWidth;
    world.roundness = worldData.roundness;
    world.spacing = worldData.spacing;
    world.treeSize = worldData.treeSize;
    world.envelopes = worldData.envelopes.map((e) => Envelope.load(e));
    world.roadBorders = worldData.roadBorders.map((s) => Segment.load(s));
    world.buildings = worldData.buildings.map((b) => Building.load(b));
    world.trees = worldData.trees.map((t) => Tree.load(t));
    world.laneGuides = worldData.laneGuides.map((s) => Segment.load(s));
    world.markings = worldData.markings.map((m) => loadMarking(m));
    world.controlCenters = worldData.controlCenters.map((c) => ControlCenter.load(c, world.markings));
    world.zoom = worldData.zoom ?? 1;
    world.offset = Point.load(worldData.offset ?? new Point(0, 0));
    return world;
  }

  /**
   * Draws the world on the canvas.
   *
   * @param ctx - The canvas rendering context.
   * @param viewPoint - The point representing the current view point.
   */
  public draw(ctx: CanvasRenderingContext2D, viewPoint: Point) {
    for (const envelope of this.envelopes) {
      envelope.draw(ctx, { fill: "#BBB", stroke: "#BBB", lineWidth: 15 });
    }

    for (const seg of this.graph.segments) {
      seg.draw(ctx, { color: "white", width: 4, dash: [10, 10] });
    }

    for (const segment of this.roadBorders) {
      segment.draw(ctx, { color: "white", width: 4 });
    }

    const items = [...this.buildings, ...this.trees];
    // we sort the items by their distance to the view point so that the closest item is drawn last
    items.sort((a, b) => Polygon.distanceToPoint(b.base, viewPoint) - Polygon.distanceToPoint(a.base, viewPoint));
    for (const item of items) {
      item.draw(ctx, viewPoint);
    }
    for (const marking of this.markings) {
      marking.draw(ctx);
    }
  }

  /**
   * Generates the world by creating road borders, buildings, trees, lane guides, and control centers.
   */
  public generate(): void {
    this.#generateRoadBorders();
    this.buildings = this.#generateBuildings();
    this.trees = this.#generateTrees();
    this.laneGuides.length = 0; // empty array, but keep the reference
    this.laneGuides.push(...this.#generateLaneGuides());
    this.generateControlCenters();
  }

  /**
   * Generates control centers based on the graph points and markings.
   * Control centers are created for each light in the markings.
   * @returns An array of control centers.
   */
  public generateControlCenters() {
    if (this.graph.points.length == 0) return [];
    const lights = this.markings.filter((m) => m instanceof Light) as Light[];
    this.controlCenters = [];
    for (const light of lights) {
      const point = Point.getNearestPoint(light.center, this.#getIntersections()) as Point;
      const controlCenter = this.controlCenters.find((c) => c.center.equals(point));
      controlCenter ? controlCenter.lights.push(light) : this.controlCenters.push(new ControlCenter(point, [light]));
    }
  }

  public saveToLocalStorage(name: string = "world") {
    window.localStorage.setItem(name, JSON.stringify(this));
  }

  /**
   * Updates the world state based on the given timestamp.
   * @param timestamp - The current timestamp.
   */
  public update(timestamp: number): void {
    if (this.controlCenters.length == 0) return;
    for (const controlCenter of this.controlCenters) {
      controlCenter.update(timestamp);
    }
  }

  /**
   * Generates buildings based on the segments of the graph.
   * @returns An array of Building objects representing the generated buildings.
   */
  #generateBuildings() {
    const tempEnvelops: Envelope[] = [];
    for (const segment of this.graph.segments) {
      tempEnvelops.push(new Envelope(segment, this.roadWidth + this.buildingWidth + this.spacing * 2, this.roundness));
    }

    const guides = Polygon.union(tempEnvelops.map((e) => e.polygon)).filter((seg) => seg.length() > this.buildingMinLength);

    const supports = [];
    for (let segment of guides) {
      const length = segment.length() + this.spacing;
      const buildCount = Math.floor(length / (this.buildingMinLength + this.spacing));
      const buildLength = length / buildCount - this.spacing;
      const direction = segment.directionVector();

      for (let i = 0; i < buildCount; i++) {
        const p1 = Point.addVector(segment.p1, Point.scaleVector(direction, buildLength * i + this.spacing * i));
        const p2 = Point.addVector(p1, Point.scaleVector(direction, buildLength));
        supports.push(new Segment(p1, p2));
      }
    }

    const epsilon = 0.01;
    const bases: Polygon[] = supports.map((segment) => new Envelope(segment, this.buildingWidth, 1).polygon);
    for (let i = 0; i < bases.length - 1; i++) {
      for (let j = i + 1; j < bases.length; j++) {
        if (Polygon.intersection(bases[i], bases[j] || Polygon.distanceToPoly(bases[i], bases[j]) < this.spacing - epsilon)) {
          bases.splice(j, 1); // remove the jth element, so have to decrement j to keep the same index
          j--;
        }
      }
    }
    return bases.map((base) => new Building(base));
  }

  /**
   * Generates lane guides based on the segments in the graph.
   * @returns An array of Segment objects representing the lane guides.
   */
  #generateLaneGuides(): Segment[] {
    const tempEnvelops: Envelope[] = [];
    for (const segment of this.graph.segments) {
      tempEnvelops.push(new Envelope(segment, this.roadWidth / 2, this.roundness));
    }
    return Polygon.union(tempEnvelops.map((e) => e.polygon));
  }

  /**
   * Generates the road borders by creating envelopes for each segment in the graph
   * and then combining them into a single polygon.
   */
  #generateRoadBorders() {
    this.envelopes.length = 0;
    for (const segment of this.graph.segments) {
      this.envelopes.push(new Envelope(segment, this.roadWidth, this.roundness));
    }

    this.roadBorders = Polygon.union(this.envelopes.map((e) => e.polygon));
  }

  /**
   * Generates an array of trees within the world.
   *
   * @returns An array of Tree objects.
   */
  #generateTrees(): Tree[] {
    const points = [...this.roadBorders.map((seg) => [seg.p1, seg.p2]).flat(), ...this.buildings.map((building) => building.base.points).flat()];
    const left = Math.min(...points.map((p) => p.x));
    const right = Math.max(...points.map((p) => p.x));
    const top = Math.min(...points.map((p) => p.y));
    const bottom = Math.max(...points.map((p) => p.y));

    const occupiedAreas = [...this.buildings.map((b) => b.base), ...this.envelopes.map((e) => e.polygon)];

    const trees: Tree[] = [];
    let tryCount = 0;
    while (tryCount < 200) {
      const p = new Point(lerp(left, right, Math.random()), lerp(bottom, top, Math.random()));
      let keep =
        occupiedAreas.every((poly) => !poly.containsPoint(p)) &&
        occupiedAreas.every((poly) => Polygon.distanceToPoint(poly, p) > this.treeSize / 2) &&
        trees.every((tree) => Point.getDistance(tree.center, p) > this.treeSize) &&
        occupiedAreas.some((poly) => Polygon.distanceToPoint(poly, p) < this.treeSize * 2);
      if (keep) {
        trees.push(new Tree(p, { size: this.treeSize }));
        tryCount = 0;
        continue;
      }
      tryCount++;
    }
    return trees;
  }

  /**
   * Returns an array of points representing the intersections in the graph.
   * @param degree The minimum number of segments that intersect at a point. Default is 2.
   * @returns An array of points representing the intersections.
   */
  #getIntersections(degree: number = 2): Point[] {
    const points = new Map<Point, number>();
    for (const segment of this.graph.segments) {
      // add the first point of the segment to the map, or increase the count if it already exists
      points.set(segment.p1, (points.get(segment.p1) ?? 0) + 1);
      points.set(segment.p2, (points.get(segment.p2) ?? 0) + 1);
    }
    // get all points in the map with a count more than 2
    const intersections = [...points.entries()].filter((entry) => entry[1] > degree).map((entry) => entry[0]);
    if (intersections.length == 0) {
      // get NearestPoint
      return [Point.getNearestPoint(this.markings[0].center, this.graph.points) as Point];
    }
    return intersections;
  }
}
