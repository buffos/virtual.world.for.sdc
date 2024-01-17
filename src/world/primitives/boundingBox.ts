export interface BoundingBox {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
}

export function bbIntersect(bb1: BoundingBox, bb2: BoundingBox): boolean {
  return bb1.xmax >= bb2.xmin && bb1.xmin <= bb2.xmax && bb1.ymax >= bb2.ymin && bb1.ymin <= bb2.ymax;
}
