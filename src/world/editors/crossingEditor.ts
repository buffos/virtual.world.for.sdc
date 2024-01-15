import Crossing from "../markings/crossing";
import MarkingEditor from "./markingEditor";
import Marking from "../markings/marking";
import Point from "../primitives/point";
import ViewPort from "../viewPort";
import World from "../world";

export default class CrossingEditor extends MarkingEditor {
  constructor(viewPort: ViewPort, world: World) {
    super(viewPort, world, world.graph.segments);
  }

  public createMarkings(center: Point, direction: Point): Marking {
    return new Crossing(center, direction, this.world.roadWidth, this.world.roadWidth / 2);
  }
}
