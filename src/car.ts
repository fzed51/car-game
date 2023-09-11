import { ControlType, Controls } from "./controls";
import { Point, Segment } from "./geometrical";
import { between, polysIntersect } from "./mathematical";
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
    maxSpeed = 3.5
  ) {
    // console.debug("Car::constructor", {
    //   x,
    //   y,
    //   width,
    //   height,
    //   controlType,
    //   maxSpeed,
    // });
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
      this.brain = new NeuralNetwork([
        this.sensor.rayCount,
        Math.ceil(this.sensor.rayCount * 1.4),
        Math.ceil(this.sensor.rayCount * 1.2),
        4,
      ]);
    }
    this.controls = new Controls(controlType);
  }

  getBox(): Segment[] {
    const box: Segment[] = [];
    const nbPoint = this.polygon.length;
    this.polygon.forEach((p, i) => {
      const next = this.polygon[(i + 1) % nbPoint];
      box.push(new Segment(p, next));
    });
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
    // if (this.sensor) debugger;
    if (polysIntersect(box, roadBorders)) {
      return true;
    }
    for (let i = 0; i < traffic.length; i++) {
      const car = traffic[i];
      if (polysIntersect(box, car.getBox())) {
        return true;
      }
    }
    return false;
  }

  private createPolygon() {
    const points: Point[] = [];
    const rad = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);
    points.push(
      this.position.add(Point.polar(this.angle + alpha, rad)),
      this.position.add(Point.polar(this.angle + Math.PI - alpha, rad)),
      this.position.add(Point.polar(this.angle + Math.PI + alpha, rad)),
      this.position.add(Point.polar(this.angle - alpha, rad))
    );
    return points;
  }

  private move() {
    if (this.damaged) {
      this.controls.forward = false;
      this.controls.reverse = false;
      this.controls.left = false;
      this.controls.right = false;
    }
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
      if (between(-0.075, this.angle, 0.075)) {
        this.angle -= 0.01 * flip;
      }
    }

    this.position = this.position.add(Point.polar(this.angle, this.speed));
  }

  draw(ctx: CanvasRenderingContext2D, color: string, drawSensor = false) {
    // console.debug("Car::draw", this.position, {
    //   a: formatRad(this.angle),
    //   v: this.speed.toFixed(0),
    // });

    ctx.beginPath();
    ctx.fillStyle = this.damaged ? "gray" : color;
    ctx.moveTo(
      this.polygon[this.polygon.length - 1].x,
      -this.polygon[this.polygon.length - 1].y
    );
    this.polygon.forEach((p) => {
      ctx.lineTo(p.x, -p.y);
    });
    ctx.fill();

    if (this.sensor && drawSensor) {
      this.sensor.draw(ctx);
    }
  }
}
