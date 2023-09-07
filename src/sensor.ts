import { Car } from "./car";
import { Point, Segment } from "./geometrical";
import { Cross, lerp } from "./mathematical";
import { Boxable } from "./types";

export class Sensor {
  car: Car;
  rayCount: number;
  rayLength: number;
  raySpread: number;
  rays: Segment[];
  readings: Cross[];

  constructor(car: Car) {
    this.car = car;
    this.rayCount = 7;
    this.rayLength = 150;
    this.raySpread = (Math.PI * 2) / 3;

    this.rays = [];
    this.readings = [];
  }

  update(roadBorders: Segment[], traffic: Boxable[]) {
    this.castRays();
    this.readings = this.rays
      .map((ray) => this.getReading(ray, roadBorders, traffic))
      .filter((r) => r !== null) as Cross[];
  }

  private getReading(ray: Segment, roadBorders: Segment[], traffic: Boxable[]) {
    const touches: Cross[] = [];

    roadBorders.forEach((bord) => {
      const touch = ray.Intersect(bord);
      if (touch) {
        touches.push(touch);
      }
    });

    traffic.forEach((car) => {
      const poly = car.getBox();
      poly.forEach((segment) => {
        const touch = ray.Intersect(segment);
        if (touch) {
          touches.push(touch);
        }
      });
    });

    if (touches.length == 0) {
      return null;
    }
    const offsets = touches.map((e) => e.offset);
    const minOffset = Math.min(...offsets);
    return touches.find((e) => e.offset == minOffset) as Cross;
  }

  private castRays() {
    this.rays = [];
    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle =
        Math.PI / 2 +
        lerp(
          this.raySpread / 2,
          -this.raySpread / 2,
          this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
        ) +
        this.car.angle;

      this.rays.push(
        new Segment(
          this.car.position,
          this.car.position.add(Point.polar(rayAngle, this.rayLength))
        )
      );
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.rayCount; i++) {
      let end = this.rays[i].b;
      if (this.readings[i]) {
        end = Point.hydrate(this.readings[i]);
      }

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "yellow";
      ctx.moveTo(this.rays[i].a.x, this.rays[i].a.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      ctx.moveTo(this.rays[i].b.x, this.rays[i].b.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  }
}
