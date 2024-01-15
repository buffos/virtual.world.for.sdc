import Light from "./markings/light";
import Marking from "./markings/marking";
import { LocalStorageControlCenters } from "./models/worldData";
import Point from "./primitives/point";

interface TrafficLightConfig {
  greenDuration?: number;
  yellowDuration?: number;
}

// 1 second
export default class ControlCenter {
  public center: Point;
  public currentTick: number;
  public greenDuration: number;
  public lights: Light[] = [];
  public previousTimestamp: number = document.timeline.currentTime as number;
  public yellowDuration: number;

  constructor(center: Point, lights: Light[] = [], { greenDuration = 2, yellowDuration = 1 }: TrafficLightConfig = {}) {
    this.center = new Point(center.x, center.y);
    this.lights = lights;
    this.greenDuration = greenDuration;
    this.yellowDuration = yellowDuration;
    this.currentTick = 0;
  }

  /**
   * Updates the control center based on the given timestamp.
   * If there are no lights, the function returns early.
   * Calculates the ticks based on the current state of the lights.
   * Sets all lights to "red" state if the delta between timestamps is greater than TICK_DURATION.
   * Adjusts the previous timestamp to remove any extra time if necessary.
   * Increases the current tick and loops back to 0 when reaching the end.
   * Determines which light is green or yellow based on the current tick.
   * If there is only one light, sets it to "red" state.
   * Sets the state of the light based on the current tick and the durations of green and yellow states.
   * @param timestamp - The current timestamp.
   */
  public update(timestamp: number) {
    if (this.lights.length == 0) return;
    const ticks = this.#calculateTicks(); // when one traffic light is green or yellow, the others are red
    const delta = timestamp - this.previousTimestamp;
    if (delta > TICK_DURATION) {
      this.#setAllLightToState("red");
      this.previousTimestamp = timestamp - (delta % TICK_DURATION); // if we are above the tick duration, we need to remove the extra time from the timestamp
      this.currentTick = (this.currentTick + Math.floor(delta / TICK_DURATION)) % ticks; // increase the ticks and loopback to 0 when we reach the end
      const lightIndex = Math.floor(this.currentTick / (this.greenDuration + this.yellowDuration)); // find which light is green or yellow
      // in case of a single light we added more time for the red state, so we have to stop the index from getting more than 0
      if (this.lights.length == 1 && lightIndex > 0) {
        this.lights[0].state = "red";
        return;
      }
      const light = this.lights[lightIndex]; // get the light
      const state = this.currentTick % (this.greenDuration + this.yellowDuration) < this.greenDuration ? "green" : "yellow"; // find the state of the light
      light.state = state;
    }
  }

  /**
   * Calculates the total number of ticks for the control center.
   *
   * @returns The total number of ticks.
   */
  #calculateTicks(): number {
    if (this.lights.length == 0) return 0;
    if (this.lights.length == 1) return this.greenDuration + this.yellowDuration + this.greenDuration;
    return this.lights.length * (this.greenDuration + this.yellowDuration);
  }

  /**
   * Sets the state of all lights to the specified state.
   * @param state The state to set the lights to. Must be one of "green", "yellow", or "red".
   */
  #setAllLightToState(state: "green" | "yellow" | "red"): void {
    for (const light of this.lights) {
      light.state = state;
    }
  }

  static load(data: LocalStorageControlCenters, markings: Marking[]): ControlCenter {
    const center = Point.load(data.center);
    const lights = markings.filter((m) => m instanceof Light) as Light[];
    const greenDuration = data.greenDuration;
    const yellowDuration = data.yellowDuration;
    // from light filter out the ones that are included in data.lights array
    // set the state of the lights to the state in data.lights
    const centerLights = lights.filter((light) => data.lights.some((l) => Point.equals(light.center, Point.load(l.center))));
    return new ControlCenter(center, centerLights, { greenDuration, yellowDuration });
  }
}

const TICK_DURATION = 1000;
