import { Cross, getIntersection } from "./mathematical";

export interface Coordinate {
  x: number;
  y: number;
}

export class Point implements Coordinate {
  constructor(public x: number, public y: number) {}
  static hydrate(position: Coordinate): Point {
    return new Point(position.x, position.y);
  }
  static polar(angle: number, ray: number): Point {
    return new Point(Math.cos(angle) * ray, Math.sin(angle) * ray);
  }
  public add(point: Point): Point {
    return new Point(this.x + point.x, this.y + point.y);
  }
}

export class Segment {
  constructor(public a: Point, public b: Point) {}
  Intersect(other: Segment): null | Cross {
    return getIntersection(this.a, this.b, other.a, other.b);
  }
}
