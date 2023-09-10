import { Car } from "./car";
import { Levels, NeuralNetwork } from "./network";
// import { Levels, NeuralNetwork } from "./network";
import { $ } from "./quickElementAccess";
import { randomInt, shuffledArray } from "./random";
import { Road } from "./road";
import "./style.css";
import { Visualizer } from "./visualizer";
// import { Visualizer } from "./visualizer";

const carCanvas = $("#carCanvas") as HTMLCanvasElement;
carCanvas.width = 300;
const carCtx = carCanvas.getContext("2d");

const networkCanvas = $<HTMLCanvasElement>("#networkCanvas");
let networkCtx: CanvasRenderingContext2D | null = null;
if (networkCanvas !== null) {
  networkCanvas.width = 300;
  networkCtx = networkCanvas.getContext("2d") as CanvasRenderingContext2D;
}

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

const N = 1000;
// const cars = generatePlayableCar()
const cars = generateCars(N);
let bestCar = cars[0];

if (localStorage.getItem("bestBrain")) {
  const nnData = String(localStorage.getItem("bestBrain"));
  if (nnData !== "") {
    const data = JSON.parse(nnData) as Levels;
    cars.forEach((car, i) => {
      car.brain && car.brain.load(data);
      if (i != 0) {
        car.brain && NeuralNetwork.mutate(car.brain, 0.1);
      }
    });
  }
}

const traffic: Car[] = generateTrafic(20);

function save() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain?.backup()));
  localStorage.setItem("bestBrainRaw", JSON.stringify(bestCar.brain));
}
$("#btn-save")?.addEventListener("click", save);

function discard() {
  localStorage.removeItem("bestBrain");
}
$("#btn-discard")?.addEventListener("click", discard);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateCars(N: number) {
  const cars = [];
  for (let i = 0; i < N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 0, 30, 50, "AI"));
  }
  return cars;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generatePlayableCar() {
  return [new Car(road.getLaneCenter(1), 0, 30, 50, "KEYS")];
}

function generateTrafic(N: number) {
  const cars = [];
  for (let d = 150; cars.length < N; d += 200) {
    const nbCarByLine = randomInt({ max: 2 });
    const lines = shuffledArray([0, 1, 2]).slice(0, nbCarByLine);
    for (let l = 0; l < lines.length; l++) {
      cars.push(new Car(road.getLaneCenter(lines[l]), d, 30, 50, "DUMMY", 2));
    }
  }
  return cars;
}

// setInterval(() => {
//   console.log({
//     carX: bestCar.position.x,
//     carY: bestCar.position.y,
//     translateRoad: bestCar.position.y - carCanvas.height * 0.7,
//   });
// }, 20000);

let nAnimate = 1000;
animate();
function animate(/*time = 0*/) {
  traffic.forEach((car) => car.update([], []));
  cars.forEach((car) => car.update(road.borders, traffic));
  bestCar = cars.find(
    (c) => c.position.y == Math.max(...cars.map((c) => c.position.y))
  ) as Car;

  // console.log(cars.map(c=>c.position.y), bestCar.position.y)

  carCanvas.height = window.innerHeight;
  networkCanvas &&
    (() => {
      networkCanvas.height = window.innerHeight;
    })();

  carCtx &&
    (() => {
      carCtx.save();
      carCtx.translate(
        0,
        carCanvas.height * (bestCar.speed / 18 + 0.5) + bestCar.position.y
      );

      road.draw(carCtx);

      traffic.forEach((car) => car.draw(carCtx, "red"));
      carCtx.globalAlpha = 0.2;
      cars.forEach((car) => car !== bestCar && car.draw(carCtx, "blue"));
      carCtx.globalAlpha = 1;
      bestCar.draw(carCtx, "blue", true);

      carCtx.beginPath();
      carCtx.fillText(
        cars.filter((c) => !c.damaged).length.toString() +
          " / " +
          cars.filter((c) => c.position.y > bestCar.position.y - 250).length.toString(),
        bestCar.position.x,
        -bestCar.position.y + 50
      );
      carCtx.fill();

      carCtx.restore();
    })();
  networkCtx &&
    (() => {
      bestCar.brain && Visualizer.drawNetwork(networkCtx, bestCar.brain);
    })();
  nAnimate--;
  if (nAnimate > 0) {
    requestAnimationFrame(animate);
  } else {
    console.log("END!");
  }
}
