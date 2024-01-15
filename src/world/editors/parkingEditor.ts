import MarkingEditor from "./markingEditor";
import Marking from "../markings/marking";
import Point from "../primitives/point";
import ViewPort from "../viewPort";
import World from "../world";
import Park from "../markings/parking";

export default class ParkingEditor extends MarkingEditor {
  constructor(viewPort: ViewPort, world: World) {
    super(viewPort, world, world.laneGuides);
  }

  public createMarkings(center: Point, direction: Point): Marking {
    return new Park(center, direction, this.world.roadWidth / 2, this.world.roadWidth / 2);
  }
}
