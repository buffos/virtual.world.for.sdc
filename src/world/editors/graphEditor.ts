import Editor from "./editor";
import Graph from "../../math/graph";
import Point from "../primitives/point";
import Segment from "../primitives/segment";
import ViewPort from "../viewPort";

export default class GraphEditor implements Editor {
  #listeners: { [key: string]: EventListenerOrEventListenerObject } = {
    contextmenu: (event: Event) => event.preventDefault(),
    mouseup: (_) => (this.dragging = false),
    mousedown: (event: Event) => this.#onMouseDown(event as MouseEvent),
    mousemove: (event: Event) => this.#onMouseMove(event as MouseEvent),
  };

  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public dragging: boolean = false;
  public graph: Graph;
  public hovered: Point | null = null;
  public mouse: Point = new Point(0, 0);
  public selected: Point | null = null;
  public viewPort: ViewPort;

  constructor(viewPort: ViewPort, graph: Graph) {
    this.viewPort = viewPort;
    this.canvas = this.viewPort.canvas;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.graph = graph;
  }

  /**
   * Disables the graph editor by removing event listeners and resetting the selected and hovered elements.
   */
  public disable() {
    this.#removeEventListeners();
    this.selected = null;
    this.hovered = null;
  }

  /**
   * Displays the graph on the canvas.
   */
  public display() {
    this.graph.draw(this.ctx);
    if (this.hovered) {
      this.hovered.draw(this.ctx, { fill: true });
    }
    if (this.selected) {
      const intent = this.hovered ? this.hovered : this.mouse;
      new Segment(this.selected, intent).draw(this.ctx, { width: 2, color: "yellow", dash: [3, 3] });
      this.selected.draw(this.ctx, { outline: true });
    }
  }

  /**
   * Disposes the graph editor by cleaning up resources and resetting state.
   */
  public dispose() {
    this.graph.dispose();
    this.selected = null;
    this.hovered = null;
  }

  /**
   * Enables the graph editor by adding event listeners.
   */
  public enable() {
    this.#addEventListeners();
  }

  /**
   * Adds event listeners to the canvas.
   */
  #addEventListeners() {
    this.canvas.addEventListener("contextmenu", this.#listeners["contextmenu"]);
    this.canvas.addEventListener("mouseup", this.#listeners["mouseup"]);
    this.canvas.addEventListener("mousedown", this.#listeners["mousedown"]);
    this.canvas.addEventListener("mousemove", this.#listeners["mousemove"]);
  }

  /**
   * Adds a point to the graph.
   *
   * @param point - The point to be added.
   */
  #addPoint(point: Point) {
    this.graph.addPoint(point);
    this.#selectPoint(point);
    this.hovered = point;
  }

  /**
   * Handles the mouse down event on the graph editor.
   * @param event The mouse event.
   */
  #onMouseDown(event: MouseEvent): void {
    if (event.button === 2) {
      // right mouse button clicked
      if (this.selected) {
        this.selected = null;
        return;
      }
      if (this.hovered) {
        this.#removePoint(this.hovered);
        return;
      }
    }
    // selection mode
    if (event.button === 0 && this.hovered) {
      // before we check if we have a selected point already and we connect those with a segment.
      this.#selectPoint(this.hovered);
      this.dragging = true; // we are over the a hovered point and clicked on it so we enable dragging.
      return;
    }
    // creation mode
    if (event.button === 0) {
      this.#addPoint(this.mouse);
    }
  }

  /**
   * Handles the mouse move event.
   * @param event - The mouse event.
   */
  #onMouseMove(event: MouseEvent): void {
    this.mouse = this.viewPort.getMousePosition(event, true);
    this.hovered = Point.getNearestPoint(this.mouse, this.graph.points, 10 * this.viewPort.zoom);
    if (this.dragging && this.selected) {
      this.selected.x = this.mouse.x;
      this.selected.y = this.mouse.y;
    }
  }

  /**
   * Removes the event listeners from the canvas.
   */
  #removeEventListeners() {
    this.canvas.removeEventListener("contextmenu", this.#listeners["contextmenu"]);
    this.canvas.removeEventListener("mouseup", this.#listeners["mouseup"]);
    this.canvas.removeEventListener("mousedown", this.#listeners["mousedown"]);
    this.canvas.removeEventListener("mousemove", this.#listeners["mousemove"]);
  }

  /**
   * Removes a point from the graph.
   * @param {Point} point - The point to be removed.
   */
  #removePoint(point: Point) {
    this.graph.removePoint(point);
    this.selected = this.selected === point ? null : this.selected;
    this.hovered = null;
  }

  /**
   * Selects a point and tries to add a segment to the graph.
   *
   * @param point The point to be selected.
   */
  #selectPoint(point: Point) {
    this.selected && this.graph.tryAddSegment(new Segment(this.selected, point));
    this.selected = point;
  }
}
