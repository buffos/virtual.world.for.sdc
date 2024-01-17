import Graph from "../world/math/graph";
import Point from "../world/primitives/point";

export default class MiniMap {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, size: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    this.canvas.width = size;
    this.canvas.height = size;
  }

  /**
   * Animates the minimap.
   *
   * @param timestamp - The current timestamp.
   * @param graph - The graph to be displayed on the minimap.
   * @param viewPoint - The current view point.
   */
  public animate(timestamp: number, graph: Graph, viewPoint: Point) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const scaler = 0.1;
    const scaledViewPoint = Point.scaleVector(viewPoint, scaler);
    this.ctx.save();
    this.ctx.translate(-scaledViewPoint.x + this.canvas.width / 2, -scaledViewPoint.y + this.canvas.height / 2);
    this.ctx.scale(scaler, scaler);
    for (const segment of graph.segments) {
      segment.draw(this.ctx, { width: 3 / scaler, color: "white" });
    }
    this.ctx.restore();
    new Point(this.canvas.width / 2, this.canvas.height / 2).draw(this.ctx, { size: 1.2 / scaler, color: "blue", outline: true });
  }

  /**
   * Sets the size of the canvas.
   * @param size - The desired size of the canvas.
   */
  public setSize(size: number) {
    this.canvas.width = size;
    this.canvas.height = size;
  }
}
