export interface Intersection {
  offset: number;
  x: number;
  y: number;
}

interface Point {
  x: number;
  y: number;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Clamps a value between a minimum and maximum range.
 * @param val The value to be clamped.
 * @param min The minimum value of the range.
 * @param max The maximum value of the range.
 * @returns The clamped value.
 */
export const clamp = (val: number, min: number, max: number): number => Math.max(Math.min(val, max), min);
export const getIntersection = (p1: Point, p2: Point, p3: Point, p4: Point): Intersection | null => {
  const A = { x: p2.x - p1.x, y: p2.y - p1.y };
  const B = { x: p3.x - p4.x, y: p3.y - p4.y };
  const C = { x: p1.x - p3.x, y: p1.y - p3.y };

  const denominator = B.x * A.y - B.y * A.x;
  const epsilon = 0.001;
  if (Math.abs(denominator) < epsilon) return null; // parallel lines
  const alpha = (B.y * C.x - B.x * C.y) / denominator;
  const beta = -(A.y * C.x - A.x * C.y) / denominator;

  if (alpha < 0 || alpha > 1 || beta > 1 || beta < 0) return null;
  // the point of intersection is P* = P1 + alpha * (P2 - P1)
  return {
    x: p1.x + alpha * (p2.x - p1.x),
    y: p1.y + alpha * (p2.y - p1.y),
    offset: alpha,
  };
};
export const getRandomColor = (): string => {
  const hue = 290 + Math.random() * 260;
  return `hsl(${hue}, 100%, 60%)`;
};
