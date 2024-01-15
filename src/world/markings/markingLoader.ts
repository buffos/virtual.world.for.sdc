import { LocalStorageMarking } from "../../models/worldData";
import Point from "../primitives/point";
import Cross from "./crossing";
import Light from "./light";
import Marking from "./marking";
import Park from "./parking";
import Start from "./start";
import Stop from "./stop";
import Target from "./target";
import Yield from "./yield";

export function loadMarking(data: LocalStorageMarking): Marking {
  switch (data.type) {
    case "cross":
      return new Cross(Point.load(data.center), Point.load(data.direction), data.width, data.height);
    case "light":
      return new Light(Point.load(data.center), Point.load(data.direction), data.width, data.height);
    case "park":
      return new Park(Point.load(data.center), Point.load(data.direction), data.width, data.height);
    case "start":
      return new Start(Point.load(data.center), Point.load(data.direction), data.width, data.height);
    case "stop":
      return new Stop(Point.load(data.center), Point.load(data.direction), data.width, data.height);
    case "target":
      return new Target(Point.load(data.center), Point.load(data.direction), data.width, data.height);
    case "yield":
      return new Yield(Point.load(data.center), Point.load(data.direction), data.width, data.height);
    default:
      throw new Error(`Unknown marking type ${data.type}`);
  }
}
