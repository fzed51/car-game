import { ControlType, Controls } from "./controls";
import { Point, Segment } from "./geometrical";
import { polysIntersect } from "./mathematical";
import { NeuralNetwork } from "./network";
import { Sensor } from "./sensor";
import { Boxable } from "./types";

export class Car implements Boxable {
  position: Point;
  width: number;
  height: number;
  speed: number;
  acceleration: number;
  maxSpeed: number;
  friction: number;
  angle: number;
  damaged: boolean;
  useBrain: boolean;
  sensor?: Sensor;
  brain?: NeuralNetwork;
  controls: Controls;
  polygon: Point[] = [];

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    controlType: ControlType,
    maxSpeed = 3
  ) {
    this.position = new Point(x, y);
    this.width = width;
    this.height = height;

    this.speed = 0;
    this.acceleration = 0.2;
    this.maxSpeed = maxSpeed;
    this.friction = 0.05;
    this.angle = Math.PI / 2;
    this.damaged = false;

    this.useBrain = controlType == "AI";

    if (controlType != "DUMMY") {
      this.sensor = new Sensor(this);
      this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
    }
    this.controls = new Controls(controlType);
  }

  getBox(): Segment[] {
    const box: Segment[] = [];
    return box;
  }

  update(roadBorders: Segment[], traffic: Boxable[]) {
    if (!this.damaged) {
      this.move();
      this.polygon = this.createPolygon();
      this.damaged = this.assessDamage(roadBorders, traffic);
    }
    if (this.sensor && this.brain) {
      this.sensor.update(roadBorders, traffic);
      const offsets = this.sensor.readings.map((s) =>
        s == null ? 0 : 1 - s.offset
      );
      const outputs = NeuralNetwork.feedForward(offsets, this.brain);

      if (this.useBrain) {
        this.controls.forward = !!outputs[0];
        this.controls.left = !!outputs[1];
        this.controls.right = !!outputs[2];
        this.controls.reverse = !!outputs[3];
      }
    }
  }

  private assessDamage(roadBorders: Segment[], traffic: Boxable[]) {
    const box = this.getBox();
    if (polysIntersect(box, roadBorders)) {
      return true;
    }
    traffic.forEach((car) => {
      if (polysIntersect(box, car.getBox())) {
        return true;
      }
    });
    return false;
  }

  private createPolygon() {
    const points: Point[] = [];
    const rad = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);
    points.push(
      this.position.add(Point.polar(-rad, alpha)),
      this.position.add(Point.polar(rad, alpha)),
      this.position.add(Point.polar(Math.PI + rad, alpha)),
      this.position.add(Point.polar(-Math.PI - rad, alpha))
    );
    return points;
  }

  private move() {
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    if (this.controls.reverse) {
      this.speed -= this.acceleration;
    }

    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }

    if (this.speed > 0) {
      this.speed -= this.friction;
    }
    if (this.speed < 0) {
      this.speed += this.friction;
    }
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    if (this.speed != 0) {
      const flip = this.speed > 0 ? 1 : -1;
      if (this.controls.left) {
        this.angle += 0.03 * flip;
      }
      if (this.controls.right) {
        this.angle -= 0.03 * flip;
      }
    }

    this.position = this.position.add(Point.polar(this.angle, this.speed));
  }

  draw(ctx: CanvasRenderingContext2D, color: string, drawSensor = false) {
    if (this.damaged) {
      ctx.fillStyle = "gray";
    } else {
      ctx.fillStyle = color;
    }
    ctx.beginPath();
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
    for (let i = 1; i < this.polygon.length; i++) {
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
    }
    ctx.fill();

    if (this.sensor && drawSensor) {
      this.sensor.draw(ctx);
    }
  }
}
