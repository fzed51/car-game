import { Coordinate, Point, Segment } from "./geometrical";

export interface Cross extends Coordinate {
  offset: number;
}

export const lerp = (A: number, B: number, t: number) => A + (B - A) * t;

export const getIntersection = (
  A: Point,
  B: Point,
  C: Point,
  D: Point
): null | Cross => {
  const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
  const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
  const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

  if (bottom != 0) {
    const t = tTop / bottom;
    const u = uTop / bottom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: lerp(A.x, B.x, t),
        y: lerp(A.y, B.y, t),
        offset: t,
      } as Cross;
    }
  }

  return null;
};

export const polysIntersect = (poly1: Segment[], poly2: Segment[]): boolean => {
  let out = false;
  poly1.forEach((segment1) => {
    poly2.forEach((segment2) => {
      const cross = segment1.Intersect(segment2);
      if (cross) {
        out = true;
      }
    });
  });
  return out;
};

export const formatPx = (v: number): string => {
  const round = Math.round(v);
  const isRound = round !== v;
  return (isRound ? "~" : "") + round.toString() + "px";
};

export const formatDeg = (a: number): string => {
  a = (a * 180) / Math.PI;
  const round = Math.round(a);
  const isRound = round !== a;
  return (isRound ? "~" : "") + round.toString() + "°";
};

export const formatRad = (a: number): string => {
  a = a / Math.PI;
  return a.toFixed(2) + "π";
};

export const between = (min: number, v: number, max: number): boolean => {
  if (v <= min || v >= max) {
    return false;
  }
  return true;
};
