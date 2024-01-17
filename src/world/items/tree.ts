import { lerp } from "../../utils/utils";
import { LocalStorageTree } from "../../models/worldData";
import Point from "../primitives/point";
import Polygon from "../primitives/polygon";

interface TreeOptions {
  heightCoefficient?: number;
  levelCount?: number;
  size?: number;
}

export default class Tree {
  public base: Polygon;
  public center: Point;
  public heightCoefficient: number;
  public levelCount: number;
  public size: number;

  constructor(point: Point, { size = 50, heightCoefficient = 0.3, levelCount = 7 }: TreeOptions = {}) {
    this.center = point;
    this.size = size;
    this.heightCoefficient = heightCoefficient;
    this.levelCount = levelCount;
    this.base = this.#generateLevel(point, size); // store the base level for collision detection
  }

  /**
   * Loads a Tree object from local storage data.
   * @param data - The local storage data representing the Tree object.
   * @returns The loaded Tree object.
   */
  public static load(data: LocalStorageTree): Tree {
    const center = Point.load(data.center);
    return new Tree(center, { size: data.size, heightCoefficient: data.heightCoefficient, levelCount: data.levelCount });
  }

  public draw(ctx: CanvasRenderingContext2D, viewPoint: Point) {
    const diff = Point.subVector(this.center, viewPoint);
    const top = Point.addVector(this.center, Point.scaleVector(diff, this.heightCoefficient));

    for (let i = 0; i < this.levelCount; i++) {
      const t = i / (this.levelCount - 1);
      const point = Point.lerp(this.center, top, t);
      const color = `rgb(30 , ${lerp(50, 200, t)} , 70)`;
      const size = lerp(this.size, 40, t);
      const poly = this.#generateLevel(point, size);
      poly.draw(ctx, { fill: color, stroke: "rgb(0,0,0)" });
    }
  }

  #generateLevel(point: Point, size: number): Polygon {
    const points = [];
    const rad = size / 2;
    for (let a = 0; a < 2 * Math.PI; a += Math.PI / 16) {
      const pseudoRandom = Math.cos(((a + this.center.x) * size) % 17) ** 2;
      const noisyRadius = rad * lerp(0.5, 1, pseudoRandom);
      points.push(Point.translate(point, a, noisyRadius));
    }
    return new Polygon(points);
  }
}
