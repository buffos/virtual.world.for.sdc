import NeuralNetwork from "../car/network";
import Visualizer from "../car/visualizer";

export default class NetworkMap {
  netCanvas: HTMLCanvasElement;
  networkCtx: CanvasRenderingContext2D;
  carWorld: any;
  constructor(canvas: HTMLCanvasElement) {
    this.netCanvas = canvas;
    this.networkCtx = canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  /**
   * Animates the network map.
   *
   * @param timestamp - The current timestamp.
   * @param bestNetwork - The best neural network to visualize.
   */
  animate(timestamp: number, bestNetwork: NeuralNetwork) {
    this.networkCtx.lineDashOffset = -timestamp / 50;
    this.networkCtx.clearRect(0, 0, this.netCanvas.width, this.netCanvas.height);
    Visualizer.drawNetwork(this.networkCtx, bestNetwork);
  }
}
