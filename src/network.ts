import { lerp } from "./mathematical";

export type Levels = Neurons[];

export class NeuralNetwork {
  levels: Level[];
  constructor(neuronCounts: number[]) {
    this.levels = [];
    for (let i = 0; i < neuronCounts.length - 1; i++) {
      this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
    }
  }

  static feedForward(givenInputs: number[], network: NeuralNetwork) {
    let outputs = network.levels[0].calculate(givenInputs);
    for (let i = 1; i < network.levels.length; i++) {
      outputs = network.levels[i].calculate(outputs);
    }
    return outputs;
  }

  static mutate(network: NeuralNetwork, amount = 1) {
    network.levels.forEach((level) => {
      for (let i = 0; i < level.biases.length; i++) {
        level.biases[i] = lerp(level.biases[i], Math.random() * 2 - 1, amount);
      }
      for (let i = 0; i < level.weights.length; i++) {
        for (let j = 0; j < level.weights[i].length; j++) {
          level.weights[i][j] = lerp(
            level.weights[i][j],
            Math.random() * 2 - 1,
            amount
          );
        }
      }
    });
  }

  backup(): Levels {
    return this.levels.map((l) => l.backup());
  }

  load(data: Levels) {
    this.levels.map((l, i) => l.load(data[i]));
  }
}

export interface Neurons {
  // inputs: number[];
  // outputs: number[];
  biases: number[];
  weights: number[][];
}

export class Level {
  public inputs: number[];
  public outputs: number[];
  public biases: number[];
  public weights: number[][];

  constructor(inputCount: number, outputCount: number) {
    this.inputs = new Array(inputCount);
    this.outputs = new Array(outputCount);
    this.biases = new Array(outputCount);

    this.weights = [];
    for (let i = 0; i < inputCount; i++) {
      this.weights[i] = new Array(outputCount);
    }

    Level.randomize(this);
  }

  backup(): Neurons {
    return {
      biases: [...this.biases],
      weights: [...this.weights.map((weight) => [...weight])],
    };
  }

  load(data: Neurons) {
    this.biases = data.biases;
    this.weights = data.weights;
  }

  private static randomize(level: Level) {
    for (let i = 0; i < level.inputs.length; i++) {
      for (let j = 0; j < level.outputs.length; j++) {
        level.weights[i][j] = Math.random() * 2 - 1;
      }
    }

    for (let i = 0; i < level.biases.length; i++) {
      level.biases[i] = Math.random() * 2 - 1;
    }
  }

  calculate(input: number[]): number[] {
    for (let i = 0; i < this.inputs.length; i++) {
      this.inputs[i] = input[i];
    }

    for (let i = 0; i < this.outputs.length; i++) {
      let sum = 0;
      for (let j = 0; j < this.inputs.length; j++) {
        sum += this.inputs[j] * this.weights[j][i];
      }

      if (sum > this.biases[i]) {
        this.outputs[i] = 1;
      } else {
        this.outputs[i] = 0;
      }
    }

    return this.outputs;
  }
}
