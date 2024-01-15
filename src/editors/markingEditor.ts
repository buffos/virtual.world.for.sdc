import Editor from "./editor";
import ViewPort from "../viewPort";
import World from "../world";
import Point from "../primitives/point";
import Segment from "../primitives/segment";
import Marking from "../markings/marking";
import Light from "../markings/light";

export default abstract class MarkingEditor implements Editor {
  #listeners: { [key: string]: EventListenerOrEventListenerObject } = {
    contextmenu: (event: Event) => event.preventDefault(),
    mousedown: (event: Event) => this.#onMouseDown(event as MouseEvent),
    mousemove: (event: Event) => this.#onMouseMove(event as MouseEvent),
  };

  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public intent: Marking | null = null;
  public mouse: Point = new Point(0, 0);
  public targetSegments: Segment[];
  public viewPort: ViewPort;
  public world: World;

  constructor(viewPort: ViewPort, world: World, targetSegments: Segment[]) {
    this.viewPort = viewPort;
    this.world = world;
    this.canvas = this.viewPort.canvas;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.targetSegments = targetSegments;
  }

  /**
   * Disables the marking editor.
   */
  public disable(): void {
    this.#removeEventListeners();
  }

  /**
   * Displays the intent by drawing it on the canvas.
   */
  public display(): void {
    if (this.intent) {
      this.intent.draw(this.ctx);
    }
  }

  /**
   * Enables the marking editor.
   */
  public enable(): void {
    this.#addEventListeners();
  }

  public abstract createMarkings(center: Point, direction: Point): Marking;

  /**
   * Adds event listeners to the canvas.
   */
  #addEventListeners() {
    this.canvas.addEventListener("contextmenu", this.#listeners["contextmenu"]);
    this.canvas.addEventListener("mousedown", this.#listeners["mousedown"]);
    this.canvas.addEventListener("mousemove", this.#listeners["mousemove"]);
  }

  /**
   * Handles the mouse down event.
   * @param event - The mouse event.
   */
  #onMouseDown(event: MouseEvent): void {
    if (event.button === 0 && this.intent) {
      this.world.markings.push(this.intent);
    }
    if (event.button === 2) {
      this.world.markings = this.world.markings.filter((marking) => marking.poly.containsPoint(this.mouse) === false);
    }
    if (this.intent instanceof Light) {
      this.world.generateControlCenters();
    }
    this.intent = null;
  }

  /**
   * Handles the mouse move event.
   * @param event - The mouse event.
   */
  #onMouseMove(event: MouseEvent): void {
    this.mouse = this.viewPort.getMousePosition(event, true);
    const segment = Segment.getNearestSegment(this.mouse, this.targetSegments, 10 * this.viewPort.zoom);
    if (segment) {
      const projection = Segment.projectPointOnto(segment, this.mouse);
      const marking = this.createMarkings(projection.point, segment.directionVector());
      this.intent = projection.offset >= 0 && projection.offset <= 1 ? marking : null;
    }
  }

  /**
   * Removes the event listeners from the canvas.
   */
  #removeEventListeners() {
    this.canvas.removeEventListener("contextmenu", this.#listeners["contextmenu"]);
    this.canvas.removeEventListener("mousedown", this.#listeners["mousedown"]);
    this.canvas.removeEventListener("mousemove", this.#listeners["mousemove"]);
  }
}
