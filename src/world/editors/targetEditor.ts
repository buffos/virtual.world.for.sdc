import MarkingEditor from "./markingEditor";
import Marking from "../markings/marking";
import Point from "../primitives/point";
import ViewPort from "../viewPort";
import World from "../world";
import Target from "../markings/target";

export default class TargetEditor extends MarkingEditor {
  constructor(viewPort: ViewPort, world: World) {
    super(viewPort, world, world.laneGuides);
  }

  public createMarkings(center: Point, direction: Point): Marking {
    return new Target(center, direction, this.world.roadWidth / 2, this.world.roadWidth / 2);
  }
}
