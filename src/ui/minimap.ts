import Graph from "../world/math/graph";
import Point from "../world/primitives/point";
import World from "../world/world";

export default class MiniMap {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, size: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    this.canvas.width = size;
    this.canvas.height = size;
  }

  setSize(size: number) {
    this.canvas.width = size;
    this.canvas.height = size;
  }

  animate(timestamp: number, graph: Graph, viewPoint: Point) {
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
}
