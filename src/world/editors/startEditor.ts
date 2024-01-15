import ViewPort from "../viewPort";
import World from "../world";
import Point from "../primitives/point";
import Start from "../markings/start";
import MarkingEditor from "./markingEditor";

export default class StartEditor extends MarkingEditor {
  constructor(viewPort: ViewPort, world: World) {
    super(viewPort, world, world.laneGuides);
  }

  createMarkings(center: Point, direction: Point) {
    return new Start(center, direction, this.world.roadWidth / 2, this.world.roadWidth / 2);
  }
}
