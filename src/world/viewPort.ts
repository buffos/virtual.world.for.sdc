import { clamp } from "../utils/utils";
import Point from "./primitives/point";

export default class ViewPort {
  public canvas: HTMLCanvasElement;
  public center: Point;
  public ctx: CanvasRenderingContext2D;
  public drag = { start: new Point(0, 0), end: new Point(0, 0), offset: new Point(0, 0), active: false };
  public offset: Point;
  public zoom: number = 1;

  constructor(canvas: HTMLCanvasElement, initialZoom: number = 1, initialOffset?: Point) {
    this.canvas = canvas;
    this.zoom = initialZoom;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.center = new Point(this.canvas.width / 2, this.canvas.height / 2); // center is the middle of the canvas
    this.offset = initialOffset ?? Point.scaleVector(this.center, -1); // move the center to the origin because we moved the canvas 0,0 to the center and mouse events are from 0,0
    this.#addEventListeners();
  }

  /**
   * Gets the view point of the viewport.
   * @returns The view point as a Point object.
   */
  public get viewPoint(): Point {
    return Point.scaleVector(this.getOffset(), -1);
  }

  /**
   * Calculates the mouse position relative to the viewport.
   * @param event The MouseEvent object containing the mouse event data.
   * @param subtractDragOffset If true the drag offset will be subtracted from the mouse position.
   * @returns A Point object representing the mouse position relative to the viewport.
   */
  public getMousePosition(event: MouseEvent, subtractDragOffset = false) {
    // units need always to be in the original coordinate system
    // offset is ALWAYS in the original coordinate system
    // the following formula coverts the mouse position to the original coordinate system
    // first we calculate the distance of the mouse position from the center of the viewport
    // then we translate the distance to the original coordinate system by multiplying it with the zoom factor
    // and then we apply the offset of the viewport push everything back to (0,0)
    // subtractDragOffset is used because when we drag there is also a non recorded offset in the drag object.
    const p = new Point((event.offsetX - this.center.x) * this.zoom - this.offset.x, (event.offsetY - this.center.y) * this.zoom - this.offset.y);
    return subtractDragOffset ? Point.subVector(p, this.drag.offset) : p;
  }

  /**
   * Gets the offset of the view port.
   * @returns The offset as a Point object.
   */
  public getOffset(): Point {
    return Point.addVector(this.offset, this.drag.offset);
  }

  /**
   * Resets the viewport by restoring the context, clearing the canvas, and applying necessary transformations.
   */
  public reset() {
    this.ctx.restore();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.center.x, this.center.y); // translate to center of canvas
    this.ctx.scale(1 / this.zoom, 1 / this.zoom); // scale the canvas
    const offset = this.getOffset(); // because we moved the origin to the center the viewport offsets it back to the origin
    this.ctx.translate(offset.x, offset.y); // apply any viewport offset
  }

  /**
   * Adds event listeners to the canvas element.
   */
  #addEventListeners() {
    this.canvas.addEventListener("wheel", (event) => this.#onWheel(event));
    this.canvas.addEventListener("mousedown", (event) => this.#onMouseDown(event));
    this.canvas.addEventListener("mousemove", (event) => this.#onMouseMove(event));
    this.canvas.addEventListener("mouseup", (event) => this.#onMouseUp(event));
  }

  /**
   * Handles the mouse down event.
   * @param event The mouse event.
   * @returns Returns any value.
   */
  #onMouseDown(event: MouseEvent): any {
    if (event.button === 1) {
      this.drag.start = this.getMousePosition(event); // get the mouse position in the global coordinate system.
      this.drag.active = true;
    }
  }

  /**
   * Handles the mouse move event.
   * @param event The mouse event.
   * @returns Returns nothing.
   */
  #onMouseMove(event: MouseEvent): any {
    if (this.drag.active) {
      this.drag.end = this.getMousePosition(event);
      this.drag.offset = Point.subVector(this.drag.end, this.drag.start);
    }
  }

  /**
   * Handles the mouse up event.
   * @param {MouseEvent} _ - The mouse event object.
   * @returns {any} - The return value.
   */
  #onMouseUp(_: MouseEvent): any {
    this.offset = Point.addVector(this.offset, this.drag.offset);
    this.drag = { start: new Point(0, 0), end: new Point(0, 0), offset: new Point(0, 0), active: false };
  }

  /**
   * Handles the wheel event to zoom in or out the view port.
   * @param event The wheel event.
   */
  #onWheel(event: WheelEvent) {
    const direction = Math.sign(event.deltaY);
    const step = 0.1;
    this.zoom += direction * step;
    this.zoom = clamp(this.zoom, 1, 5); // clamp zoom between 1 and 5
  }
}
