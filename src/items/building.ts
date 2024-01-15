import { LocalStorageBuilding } from "../models/worldData";
import Point from "../primitives/point";
import Polygon from "../primitives/polygon";

interface BuildingOptions {
  height?: number;
}

export default class Building {
  public base: Polygon;
  public height: number;

  constructor(base: Polygon, { height = 200 }: BuildingOptions = {}) {
    this.base = base;
    this.height = height;
  }

  public draw(ctx: CanvasRenderingContext2D, viewPoint: Point) {
    // ceiling
    const topPoints = this.base.points.map((p) => Point.getFake3dPoint(p, viewPoint, this.height * 0.6));
    const ceiling = new Polygon(topPoints);

    // sides
    const sides = [];
    for (let i = 0; i < this.base.points.length; i++) {
      const nextI = (i + 1) % this.base.points.length;
      const poly = new Polygon([this.base.points[i], this.base.points[nextI], topPoints[nextI], topPoints[i]]);
      sides.push(poly);
    }
    // we sort the sides by their distance to the view point so that the closest side is drawn last
    // this is because the closest side is the one that is most likely to be visible
    sides.sort((a, b) => Polygon.distanceToPoint(b, viewPoint) - Polygon.distanceToPoint(a, viewPoint));

    const baseMidpoints = [Point.average([this.base.points[0], this.base.points[1]]), Point.average([this.base.points[2], this.base.points[3]])];

    const topMidpoints = baseMidpoints.map((p) => Point.getFake3dPoint(p, viewPoint, this.height));

    const roofPolygons = [
      new Polygon([ceiling.points[0], ceiling.points[3], topMidpoints[1], topMidpoints[0]]),
      new Polygon([ceiling.points[2], ceiling.points[1], topMidpoints[0], topMidpoints[1]]),
    ];
    roofPolygons.sort((a, b) => Polygon.distanceToPoint(b, viewPoint) - Polygon.distanceToPoint(a, viewPoint));

    this.base.draw(ctx, { fill: "white", stroke: "#AAA" });
    for (const side of sides) {
      side.draw(ctx, { fill: "white", stroke: "#AAA" });
    }
    ceiling.draw(ctx, { fill: "white", stroke: "#AAA" });
    for (const poly of roofPolygons) {
      poly.draw(ctx, { fill: "#D44", stroke: "#C44", lineWidth: 8, join: "round" });
    }
  }

  static load(data: LocalStorageBuilding): Building {
    const base = Polygon.load(data.base);
    return new Building(base, { height: data.height });
  }
}
