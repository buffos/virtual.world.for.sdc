import { Intersection, getIntersection, lerp } from "../utils/utils";
import { Reading } from "../models/carTypes";
import Point from "../world/primitives/point";
import Segment from "../world/primitives/segment";
import Car from "./car";

export default class Sensor {
  public rayCount: number = 5;
  public rayLength: number = 300;
  public raySpread: number = Math.PI / 2;
  public rays: Segment[] = [];
  public readings: Reading[] = [];

  constructor() {
    this.rayCount = 5;
    this.rayLength = 300;
    this.raySpread = Math.PI / 2;

    this.rays = [];
    this.readings = [];
  }

  /**
   * Draws the sensor rays on the canvas.
   *
   * @param ctx - The canvas rendering context.
   */
  public draw(ctx: CanvasRenderingContext2D) {
    for (const [index, ray] of this.rays.entries()) {
      let end = ray.p2;
      if (this.readings[index] && this.readings[index] != undefined && this.readings[index] != null) {
        end = new Point(this.readings[index]!.x, this.readings[index]!.y);
      }
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "yellow";
      ctx.moveTo(ray.p1.x, ray.p1.y);
      ctx.lineTo(end.x, end.y); // stop the line at the first touch point
      ctx.stroke();
      // draw the line without stopping at the first touch point
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      ctx.moveTo(ray.p2.x, ray.p2.y); // paint the rest of the ray if the points do not coincide.
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  }

  /**
   * Updates the sensor readings based on the current state of the car, road borders, and traffic cars.
   * @param car - The car object.
   * @param roadBorders - An array of road borders.
   * @param trafficCars - An array of traffic cars.
   */
  public update(car: Car, roadBorders: Segment[], trafficCars: Car[]) {
    this.#castRays(car);
    this.readings = [];
    for (const ray of this.rays) {
      this.readings.push(this.#getReading(ray, roadBorders, trafficCars));
    }
  }

  /**
   * Casts rays from the car's center in multiple directions to detect obstacles.
   * @param car - The car object.
   */
  #castRays(car: Car) {
    this.rays = [];
    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle =
        lerp(
          this.raySpread / 2,
          -this.raySpread / 2,
          this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1) // for 1 ray just set one in the middle.
        ) + car.angle;
      const start = car.center;
      const end = Point.translate(start, rayAngle, this.rayLength);
      this.rays.push(new Segment(start, end));
    }
  }

  /**
   * Calculates the intersection point between a ray and the road borders and traffic cars.
   * @param ray - The ray segment representing the sensor's line of sight.
   * @param roadBorders - An array of road border segments.
   * @param trafficCars - An array of traffic cars.
   * @returns The intersection point with the smallest offset from the ray's origin, or null if no intersections are found.
   */
  #getReading(ray: Segment, roadBorders: Segment[], trafficCars: Car[]): Intersection | undefined | null {
    let touches: Intersection[] = [];
    for (let roadBorder of roadBorders) {
      const touch = getIntersection(ray.p1, ray.p2, roadBorder.p1, roadBorder.p2);
      if (touch) touches.push(touch);
    }
    for (let trafficCar of trafficCars) {
      const poly = trafficCar.polygon;
      for (let i = 0; i < poly.points.length; i++) {
        const value = getIntersection(ray.p1, ray.p2, poly.points[i], poly.points[(i + 1) % poly.points.length]);
        if (value) touches.push(value);
      }
    }
    if (touches.length == 0) return null;
    const offsets = touches.map((e) => e.offset);
    const minOffset = Math.min(...offsets);
    return touches.find((e) => e.offset == minOffset); // find the one with the smallest offset.
  }
}
