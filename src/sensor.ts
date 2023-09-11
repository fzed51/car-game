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
  readings: (Cross | null)[];

  constructor(car: Car) {
    this.car = car;
    this.rayCount = 9;
    this.rayLength = 200;
    this.raySpread = (Math.PI * 6) / 4;

    this.rays = [];
    this.readings = [];
  }

  update(roadBorders: Segment[], traffic: Boxable[]) {
    this.castRays();
    this.readings = this.rays.map((ray) =>
      this.getReading(ray, roadBorders, traffic)
    );
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
        lerp(
          this.raySpread / 2,
          -this.raySpread / 2,
          this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
        ) + this.car.angle;
      const ratioLength =
        lerp(
          -Math.PI / 2,
          Math.PI / 2,
          this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
        );
      const length =
        this.rayLength *2/3 + ((this.rayLength ) /3) * Math.cos(ratioLength);
      this.rays.push(
        new Segment(
          this.car.position,
          this.car.position.add(Point.polar(rayAngle, length))
        )
      );
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.rays.forEach((ray, i) => {
      let end = this.rays[i].b;
      const read = this.readings[i];
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "yellow";
      ctx.moveTo(ray.a.x, -ray.a.y);

      if (read !== null) {
        end = Point.hydrate(read);
        ctx.lineTo(end.x, -end.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.moveTo(end.x, -end.y);
        ctx.lineTo(ray.b.x, -ray.b.y);
        ctx.stroke();
      } else {
        ctx.lineTo(end.x, -end.y);
      }
      ctx.stroke();
    });
  }
}
