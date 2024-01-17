import { ControlType } from "../models/carTypes";
import Point from "../world/primitives/point";
import Polygon from "../world/primitives/polygon";
import Segment from "../world/primitives/segment";
import Controls from "./controls";
import NeuralNetwork from "./network";
import Sensor from "./sensor";

interface CarOptions {
  angle: number;
  color?: string;
  controlType: ControlType;
  height: number;
  maxSpeed?: number;
  width: number;
  x: number;
  y: number;
}

export default class Car {
  public acceleration: number = 0.2;
  public angle: number = 0;
  public brain: NeuralNetwork | null;
  public center: Point;
  public color: string = "blue";
  public controls: Controls;
  public damaged: boolean = false;
  public fitness: number = 0;
  public friction: number = 0.05;
  public height: number;
  public img: HTMLImageElement;
  public mask: HTMLCanvasElement;
  public maxSpeed: number = 3;
  public polygon: Polygon;
  public sensor: Sensor | null;
  public speed: number = 0;
  public useBrain: boolean;
  public width: number;

  constructor(options: CarOptions) {
    this.center = new Point(options.x, options.y);
    this.width = options.width;
    this.height = options.height;
    this.angle = options.angle;
    this.maxSpeed = options.maxSpeed ?? 3;
    this.polygon = this.#createPolygon();
    this.color = options.color ?? "blue";

    this.useBrain = options.controlType == "AI";
    this.sensor = options.controlType != "DUMMY" ? new Sensor() : null;
    this.brain = options.controlType != "DUMMY" ? new NeuralNetwork([this.sensor!.rayCount, 6, 4]) : null; // we have 4 output neurons: forward, reverse, left, right
    this.controls = new Controls(options.controlType);
    this.img = new Image();
    this.img.src = "/src/car/car.png";
    this.mask = document.createElement("canvas");
    this.mask.width = this.width;
    this.mask.height = this.height;
    const maskCtx = this.mask.getContext("2d") as CanvasRenderingContext2D;
    this.img.onload = () => {
      maskCtx.fillStyle = this.color;
      maskCtx.rect(0, 0, this.width, this.height);
      maskCtx.fill();
      maskCtx.globalCompositeOperation = "destination-atop";
      maskCtx.drawImage(this.img, 0, 0, this.width, this.height);
    };
  }

  public draw(ctx: CanvasRenderingContext2D, drawSensor = false) {
    drawSensor && this.sensor?.draw(ctx);
    ctx.save();
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(-this.angle);
    if (!this.damaged) {
      ctx.drawImage(this.mask, -this.width / 2, -this.height / 2, this.width, this.height);
      ctx.globalCompositeOperation = "multiply";
    }
    ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }

  public update(roadBorders: Segment[], trafficCars: Car[]) {
    if (!this.damaged) {
      this.#move();
      this.fitness += this.speed;
      this.polygon = this.#createPolygon();
      this.damaged = this.#assessDamage(roadBorders, trafficCars);
    }
    if (this.sensor) {
      this.sensor.update(this, roadBorders, trafficCars);
      const offsets = this.sensor.readings.map((s) => (s == null ? 0 : 1 - s.offset));
      if (this.useBrain && this.brain) {
        const neuralNetworkOutput = NeuralNetwork.feedForward(offsets, this.brain);
        this.controls.forward = neuralNetworkOutput[0] > 0.5;
        this.controls.reverse = neuralNetworkOutput[1] > 0.5;
        this.controls.left = neuralNetworkOutput[2] > 0.5;
        this.controls.right = neuralNetworkOutput[3] > 0.5;
      }
    }
  }

  #assessDamage(roadBorders: Segment[], trafficCars: Car[]) {
    for (let roadBorder of roadBorders) {
      if (Polygon.intersection(this.polygon, new Polygon([roadBorder.p1, roadBorder.p2]))) {
        return true;
      }
    }
    for (let trafficCar of trafficCars) {
      if (trafficCar === this) continue;
      if (Polygon.intersection(this.polygon, trafficCar.polygon)) {
        return true;
      }
    }
    return false;
  }

  #createPolygon() {
    const rad = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);
    const points = [
      new Point(this.center.x + rad * Math.sin(this.angle + alpha), this.center.y + rad * Math.cos(this.angle + alpha)),
      new Point(this.center.x + rad * Math.sin(this.angle - alpha), this.center.y + rad * Math.cos(this.angle - alpha)),
      new Point(this.center.x + rad * Math.sin(this.angle + Math.PI + alpha), this.center.y + rad * Math.cos(this.angle + Math.PI + alpha)),
      new Point(this.center.x + rad * Math.sin(this.angle + Math.PI - alpha), this.center.y + rad * Math.cos(this.angle + Math.PI - alpha)),
    ];
    // now create the Segments and then the polygon
    return new Polygon(points);
  }

  #move() {
    // controls change speed
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    if (this.controls.reverse) {
      this.speed -= this.acceleration;
    }
    // speed limit
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }
    // friction
    if (this.speed > 0) {
      this.speed -= this.friction;
    }
    if (this.speed < 0) {
      this.speed += this.friction;
    }
    // zero speed below friction
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    let flip = this.speed > 0 ? 1 : -1;
    if (this.speed === 0) {
      flip = 0;
    }

    if (this.controls.left) {
      this.angle += 0.03 * flip;
    }
    if (this.controls.right) {
      this.angle -= 0.03 * flip;
    }

    this.center.x -= Math.sin(this.angle) * this.speed;
    this.center.y -= Math.cos(this.angle) * this.speed;
  }
}
