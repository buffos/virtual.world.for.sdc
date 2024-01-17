import Editor from "../world/editors/editor";
import Marking from "../world/markings/marking";
import Start from "../world/markings/start";
import Point from "../world/primitives/point";
import ViewPort from "../world/viewPort";
import World from "../world/world";
import Car from "./car";
import NeuralNetwork from "./network";

interface CarWorldOptions {
  NoOfCars: number;

  // Number of cars in the world
}

export default class CarWorld implements Editor {
  private enabled: boolean = false;

  public N: number;
  public cars: Car[];
  public ctx: CanvasRenderingContext2D;
  public trafficCars: Car[];

  constructor(viewPort: ViewPort, world: World, options: CarWorldOptions) {
    this.N = options.NoOfCars;
    this.ctx = viewPort.ctx;
    this.cars = this.#generateCars(world.markings);
    this.trafficCars = this.#generateTrafficCars();
  }

  public disable(): void {
    this.enabled = false;
  }

  public display(): void {
    if (!this.enabled) return;
    this.ctx.globalAlpha = 0.2;
    for (const car of this?.cars ?? []) {
      car.draw(this.ctx);
    }
    this.ctx.globalAlpha = 1;
    if (this?.getBestCar()) {
      this.getBestCar().draw(this.ctx, true);
    }
  }

  public enable(world: World): void {
    this.cars = this.#generateCars(world.markings);
    this.trafficCars = this.#generateTrafficCars();
    this.enabled = true;
  }

  public getBestCar(): Car {
    return this.cars.find((car) => car.fitness == Math.max(...this.cars.map((car) => car.fitness))) as Car;
  }

  public getBestCarBrain(): NeuralNetwork {
    return this.getBestCar().brain as NeuralNetwork;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public update(world: World): void {
    if (!this.enabled) return;
    for (const car of this.trafficCars) {
      car.update(world.roadBorders, this.trafficCars);
    }
    for (const car of this.cars) {
      car.update(world.roadBorders, this.trafficCars);
    }
  }

  #generateCars(markings: Marking[]): Car[] {
    const startPoints = markings.filter((m) => m instanceof Start);
    const startPoint = startPoints.length > 0 ? startPoints[0].center : new Point(100, 100); // peek the first start point or (100,100)
    const dir = startPoints.length > 0 ? startPoints[0].direction : new Point(0, -1);
    const startAngle = -Point.angle(dir) + Math.PI / 2;

    const cars = [];
    for (let i = 1; i <= this.N; i++) {
      cars.push(new Car({ x: startPoint.x, y: startPoint.y, width: 30, height: 50, controlType: "AI", angle: startAngle, maxSpeed: 3, color: "blue" }));
    }
    return cars;
  }

  #generateTrafficCars(): Car[] {
    return [] as Car[];
  }
}
