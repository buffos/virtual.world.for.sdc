import ViewPort from "../viewPort";
import World from "../world";
import Point from "../primitives/point";
import Stop from "../markings/stop";
import MarkingEditor from "./markingEditor";

export default class StopEditor extends MarkingEditor {
  constructor(viewPort: ViewPort, world: World) {
    super(viewPort, world, world.laneGuides);
  }

  createMarkings(center: Point, direction: Point) {
    return new Stop(center, direction, this.world.roadWidth / 2, this.world.roadWidth / 2);
  }
}
