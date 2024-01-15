import MarkingEditor from "./markingEditor";
import Marking from "../markings/marking";
import Point from "../primitives/point";
import ViewPort from "../viewPort";
import World from "../world";
import Light from "../markings/light";

export default class LightEditor extends MarkingEditor {
  constructor(viewPort: ViewPort, world: World) {
    super(viewPort, world, world.laneGuides);
  }

  public createMarkings(center: Point, direction: Point): Marking {
    return new Light(center, direction, this.world.roadWidth / 2, 18);
  }
}
