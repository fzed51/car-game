import { lerp } from "./mathematical";
import { randomNumber } from "./random";

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
    console.group("mutate");
    console.log(network.levels[0].backup());
    network.levels.forEach((level) => {
      for (let i = 0; i < level.biases.length; i++) {
        level.biases[i] = lerp(
          level.biases[i],
          randomNumber({ min: -1, max: 1 }),
          amount
        );
      }
      for (let j = 0; j < level.weights.length; j++) {
        for (let k = 0; k < level.weights[j].length; k++) {
          level.weights[j][k] = lerp(
            level.weights[j][k],
            randomNumber({ min: -1, max: 1 }),
            amount
          );
        }
      }
    });
    console.log(network.levels[0].backup());
    console.groupEnd();
  }

  backup(): Levels {
    return this.levels.map((l) => l.backup());
  }

  load(data: Levels) {
    this.levels.forEach((level, i) => level.load(data[i]));
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
    this.biases = [...data.biases];
    this.weights = [...data.weights.map(x => [...x])];
  }

  private static randomize(level: Level) {
    for (let i = 0; i < level.inputs.length; i++) {
      for (let j = 0; j < level.outputs.length; j++) {
        level.weights[i][j] = randomNumber({ min: -1, max: 1 });
      }
    }

    for (let i = 0; i < level.biases.length; i++) {
      level.biases[i] = randomNumber({ min: -1, max: 1 });
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
