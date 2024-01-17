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

/**
 * Represents the world of cars in the simulation.
 * Implements the Editor interface.
 */
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

  /**
   * Disables the car world.
   */
  public disable(): void {
    this.enabled = false;
  }

  /**
   * Displays the cars in the car world.
   * If the car world is enabled, it sets the global alpha to 0.2 and draws each car on the canvas.
   * It then sets the global alpha back to 1 and draws the best car on the canvas if available.
   */
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

  /**
   * Enables the car world by generating cars and traffic cars.
   *
   * @param world - The world object.
   * @returns void
   */
  public enable(world: World): void {
    this.cars = this.#generateCars(world.markings);
    this.trafficCars = this.#generateTrafficCars();
    this.enabled = true;
  }

  /**
   * Returns the best car based on fitness.
   * @returns The best car.
   */
  public getBestCar(): Car {
    return this.cars.find((car) => car.fitness == Math.max(...this.cars.map((car) => car.fitness))) as Car;
  }

  /**
   * Retrieves the best car's brain as a NeuralNetwork.
   * @returns The best car's brain as a NeuralNetwork.
   */
  public getBestCarBrain(): NeuralNetwork {
    return this.getBestCar().brain as NeuralNetwork;
  }

  /**
   * Checks if the car world is enabled.
   * @returns {boolean} True if the car world is enabled, false otherwise.
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Updates the car world by updating each car's position and behavior.
   *
   * @param world - The world object containing road borders and other cars.
   */
  public update(world: World): void {
    if (!this.enabled) return;
    for (const car of this.trafficCars) {
      car.update(world.roadBorders, this.trafficCars);
    }
    for (const car of this.cars) {
      car.update(world.roadBorders, this.trafficCars);
    }
  }

  /**
   * Generates an array of cars based on the given markings.
   *
   * @param markings - The array of markings.
   * @returns An array of Car objects.
   */
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

  /**
   * Generates traffic cars.
   * @returns An array of Car objects representing the traffic cars.
   */
  #generateTrafficCars(): Car[] {
    return [] as Car[];
  }
}
