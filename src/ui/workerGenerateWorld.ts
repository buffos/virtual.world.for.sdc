import Graph from "../world/math/graph";
import Point from "../world/primitives/point";
import World from "../world/world";

self.onmessage = (event) => {
  const data = event.data;
  const world = new World(new Graph([], []), { roadWidth: 100, roundness: 5 });
  world.graph.points = data.points;
  world.graph.segments = data.segments;
  world.generate();
  world.zoom = 1;
  world.offset = new Point(0, 0);
  self.postMessage(encodeURIComponent(JSON.stringify(world)));
};
