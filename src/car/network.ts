import { lerp } from "../utils/utils";

export class Level {
  public biases: number[];
  public inputs: number[];
  public outputs: number[];
  public weights: number[][];

  constructor(inputCount: number, outputCount: number) {
    this.inputs = new Array(inputCount);
    this.outputs = new Array(outputCount);
    this.biases = new Array(outputCount);
    this.weights = [];

    for (let i = 0; i < inputCount; i++) {
      const weightArray = new Array(outputCount);
      this.weights.push(weightArray);
    }
    Level.#randomize(this);
  }

  /**
   * Performs a feed-forward operation on the neural network.
   *
   * @param givenInputs - The input values for the network.
   * @param level - The level of the network.
   * @returns An array of output values.
   */
  public static feedForward(givenInputs: number[], level: Level): number[] {
    for (let j = 0; j < level.outputs.length; j++) {
      let sum = 0;
      for (let i = 0; i < level.inputs.length; i++) {
        level.inputs[i] = givenInputs[i]; // save inputs for later
        sum += givenInputs[i] * level.weights[i][j];
      }
      sum -= level.biases[j]; // normal it would be += level.biases[j] but we are using negative biases
      level.outputs[j] = Level.simpleSigmoid(sum);
    }
    return level.outputs;
  }

  /**
   * Calculates the sigmoid of a given number.
   * The sigmoid function returns a value between 0 and 1.
   * @param x - The input number.
   * @returns The sigmoid of the input number.
   */
  public static sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  /**
   * Applies a simple sigmoid function to the given input.
   * @param x The input value.
   * @returns The result of the sigmoid function (1 if x > 0, 0 otherwise).
   */
  public static simpleSigmoid(x: number): number {
    return x > 0 ? 1 : 0;
  }

  /**
   * Randomizes the weights and biases of a given level.
   * @param level - The level to randomize.
   */
  static #randomize(level: Level) {
    for (let i = 0; i < level.inputs.length; i++) {
      for (let j = 0; j < level.outputs.length; j++) {
        level.weights[i][j] = Math.random() * 2 - 1;
      }
    }
    for (let j = 0; j < level.outputs.length; j++) {
      level.biases[j] = Math.random() * 2 - 1;
    }
  }
}

export default class NeuralNetwork {
  public levels: Level[];

  constructor(neuronCount: number[]) {
    this.levels = [];
    for (let i = 0; i < neuronCount.length - 1; i++) {
      this.levels.push(new Level(neuronCount[i], neuronCount[i + 1]));
    }
  }

  /**
   * Performs a feed-forward operation on the given inputs using the provided neural network.
   * @param givenInputs - The inputs to be fed into the network.
   * @param network - The neural network to perform the feed-forward operation on.
   * @returns The outputs produced by the network after the feed-forward operation.
   */
  public static feedForward(givenInputs: number[], network: NeuralNetwork) {
    let inputs = givenInputs;
    for (const level of network.levels) {
      inputs = Level.feedForward(inputs, level);
    }
    return inputs;
  }

  /**
   * Mutates the given neural network by randomly adjusting the biases and weights of its levels.
   * @param network The neural network to mutate.
   * @param amount The amount of mutation to apply. Defaults to 1.
   */
  public static mutate(network: NeuralNetwork, amount = 1) {
    network.levels.forEach((level) => {
      for (let i = 0; i < level.biases.length; i++) {
        level.biases[i] = lerp(level.biases[i], Math.random() * 2 - 1, amount);
      }
      for (let i = 0; i < level.weights.length; i++) {
        for (let j = 0; j < level.weights[i].length; j++) {
          level.weights[i][j] = lerp(level.weights[i][j], Math.random() * 2 - 1, amount);
        }
      }
    });
  }
}
