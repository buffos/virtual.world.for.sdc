import { lerp } from "../math/utils";
import NeuralNetwork, { Level } from "./network";

export default class Visualizer {
  /**
   * Draws a level on the canvas.
   *
   * @param ctx - The canvas rendering context.
   * @param level - The level to be drawn.
   * @param left - The left position of the level.
   * @param top - The top position of the level.
   * @param width - The width of the level.
   * @param height - The height of the level.
   * @param outputLabels - The labels for the output nodes.
   */
  public static drawLevel(ctx: CanvasRenderingContext2D, level: Level, left: number, top: number, width: number, height: number, outputLabels: string[]) {
    const right = left + width;
    const bottom = top + height;

    const { inputs, outputs, weights, biases } = level;

    for (let i = 0; i < inputs.length; i++) {
      for (let j = 0; j < outputs.length; j++) {
        ctx.beginPath();
        ctx.moveTo(Visualizer.#getNodeX(inputs, i, left, right), bottom);
        ctx.lineTo(Visualizer.#getNodeX(outputs, j, left, right), top);
        ctx.lineWidth = 2;
        ctx.strokeStyle = getRGBA(weights[i][j]);
        ctx.stroke();
      }
    }

    const nodeRadius = 18;
    for (let i = 0; i < inputs.length; i++) {
      const x = Visualizer.#getNodeX(inputs, i, left, right);
      ctx.beginPath();
      ctx.arc(x, bottom, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, bottom, nodeRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = getRGBA(inputs[i]);
      ctx.fill();
    }

    for (let i = 0; i < outputs.length; i++) {
      const x = Visualizer.#getNodeX(outputs, i, left, right);
      ctx.beginPath();
      ctx.arc(x, top, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, top, nodeRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = getRGBA(outputs[i]);
      ctx.fill();

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.arc(x, top, nodeRadius * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = getRGBA(biases[i]);
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      if (outputLabels[i]) {
        ctx.beginPath();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "black";
        ctx.strokeStyle = "white";
        ctx.font = nodeRadius * 1.5 + "px Arial";
        ctx.fillText(outputLabels[i], x, top + nodeRadius * 0.1);
        ctx.lineWidth = 0.5;
        ctx.strokeText(outputLabels[i], x, top + nodeRadius * 0.1);
      }
    }
  }

  /**
   * Draws the neural network on the canvas.
   *
   * @param ctx - The canvas rendering context.
   * @param network - The neural network to be visualized.
   */
  public static drawNetwork(ctx: CanvasRenderingContext2D, network: NeuralNetwork): void {
    const margin = 50;
    const left = margin;
    const top = margin;
    const width = ctx.canvas.width - margin * 2;
    const height = ctx.canvas.height - margin * 2;

    const levelHeight = height / network.levels.length;

    for (let i = network.levels.length - 1; i >= 0; i--) {
      const levelTop = top + lerp(height - levelHeight, 0, network.levels.length == 1 ? 0.5 : i / (network.levels.length - 1));
      ctx.setLineDash([7, 3]);

      Visualizer.drawLevel(ctx, network.levels[i], left, levelTop, width, levelHeight, i == network.levels.length - 1 ? ["🠉", "🠋", "🠈", "🠊"] : []);
    }
  }

  /**
   * Calculates the x-coordinate of a node based on its index and the left and right boundaries.
   * @param nodes - The array of nodes.
   * @param index - The index of the node.
   * @param left - The left boundary.
   * @param right - The right boundary.
   * @returns The x-coordinate of the node.
   */
  static #getNodeX(nodes: number[], index: number, left: number, right: number): number {
    return lerp(left, right, nodes.length == 1 ? 0.5 : index / (nodes.length - 1));
  }
}

/**
 * Returns an RGBA color string based on the given value.
 * The alpha value is determined by the absolute value of the input.
 * If the input is positive, the color is red, otherwise it is green.
 * The blue component is always 0.
 *
 * @param value - The input value.
 * @returns The RGBA color string.
 */
function getRGBA(value: number): string {
  const alpha = Math.abs(value);
  const R = value > 0 ? 0 : 255;
  const G = value < 0 ? 0 : 255;
  const B = 0;
  return `rgba(${R},${G},${B},${alpha})`;
}
