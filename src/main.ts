import { Car } from "./car";
import { Levels, NeuralNetwork } from "./network";
import { $ } from "./quickElementAccess";
import { Road } from "./road";
import "./style.css";
import { Visualizer } from "./visualizer";

const carCanvas = $("#carCanvas") as HTMLCanvasElement;
carCanvas.width = 200;
const networkCanvas = $("#networkCanvas") as HTMLCanvasElement;
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
if (carCtx === null) {
  throw new Error("Impossible d'initialiser carCtx");
}
const networkCtx = networkCanvas.getContext("2d");
if (networkCtx === null) {
  throw new Error("Impossible d'initialiser networkCtx");
}

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

const N = 1;
const cars = generateCars(N);
let bestCar = cars[0];

if (localStorage.getItem("bestBrain")) {
  const nnData = String(localStorage.getItem("bestBrain"));
  if (nnData !== "") {
    const data = JSON.parse(nnData) as Levels;
    cars.forEach((car, i) => {
      car.brain = NeuralNetwork.hydrate(data);
      if (i != 0) {
        NeuralNetwork.mutate(car.brain, 0.1);
      }
    });
  }
}

// const traffic: Car[] = [];
const traffic = [
  new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2),
  new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2),
  new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2),
  new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2),
  new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2),
  new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 2),
  new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", 2),
];

animate();

function save() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}
$("#btn-save")?.addEventListener("click", save);

function discard() {
  localStorage.removeItem("bestBrain");
}
$("#btn-discard")?.addEventListener("click", discard);

function generateCars(N: number) {
  const cars = [];
  for (let i = 1; i <= N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
  }
  return cars;
}

function animate() {
  traffic.forEach((car) => car.update(road.borders, []));
  cars.forEach((car) => car.update(road.borders, traffic));
  bestCar = cars.find(
    (c) => c.position.y == Math.min(...cars.map((c) => c.position.y))
  ) as Car;

  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  carCtx &&
    (() => {
      carCtx.save();
      carCtx.translate(0, -bestCar.position.y + carCanvas.height * 0.7);

      road.draw(carCtx);

      traffic.forEach((car) => car.draw(carCtx, "red"));

      carCtx.globalAlpha = 0.2;
      cars.forEach((car) => car.draw(carCtx, "blue"));
      carCtx.globalAlpha = 1;
      bestCar.draw(carCtx, "blue", true);

      carCtx.restore();
    })();

  networkCtx &&
    bestCar.brain &&
    Visualizer.drawNetwork(networkCtx, bestCar.brain);

  requestAnimationFrame(animate);
}
