export interface LocalStorageBuilding {
  base: LocalStoragePolygon;
  height: number;
}

export interface LocalStorageControlCenters {
  center: LocalStoragePoint;
  greenDuration: number;
  lights: LocalStorageMarking[];
  yellowDuration: number;
}

export interface LocalStorageEnvelope {
  polygon: LocalStoragePolygon;
  skeleton: LocalStorageSegment;
}

export interface LocalStorageGraph {
  points: { x: number; y: number }[];
  segments: { p1: { x: number; y: number }; p2: { x: number; y: number } }[];
}

export interface LocalStorageMarking {
  center: LocalStoragePoint;
  direction: LocalStoragePoint;
  height: number;
  type: "light" | "start" | "stop" | "yield" | "park" | "target" | "cross";
  width: number;
}

export interface LocalStoragePoint {
  x: number;
  y: number;
}

export interface LocalStoragePolygon {
  points: LocalStoragePoint[];
}

export interface LocalStorageSegment {
  oneWay: boolean;
  p1: LocalStoragePoint;
  p2: LocalStoragePoint;
}

export interface LocalStorageTree {
  center: LocalStoragePoint;
  heightCoefficient: number;
  levelCount: number;
  size: number;
}

export interface WorldData {
  buildingMinLength: number;
  buildingWidth: number;
  buildings: LocalStorageBuilding[];
  controlCenters: LocalStorageControlCenters[];
  envelopes: LocalStorageEnvelope[];
  graph: LocalStorageGraph;
  laneGuides: LocalStorageSegment[];
  markings: LocalStorageMarking[];
  offset: LocalStoragePoint;
  roadBorders: LocalStorageSegment[];
  roadWidth: number;
  roundness: number;
  spacing: number;
  treeSize: number;
  trees: LocalStorageTree[];
  zoom: number;
}
