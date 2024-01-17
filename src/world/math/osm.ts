import { boundingBox, latLonToScreenXY, measureEarthPoints } from "../../utils/utils.earth";
import Point from "../primitives/point";
import Segment from "../primitives/segment";
import ViewPort from "../viewPort";
import World from "../world";

interface CreateBodyOptions {
  distance: number;
  lat: number;
  lon: number;
  motorway: boolean;
  primary: boolean;
  secondary: boolean;
  tertiary: boolean;
  timeOut: number;
  trunk: boolean;
  scale: number;
  distanceThreshold: number; // do not add points closer than this distance.
}

interface OsmNode {
  id: number;
  lat: number;
  lon: number;
  type: "node";
}

interface OsmWay {
  id: number;
  nodes: number[];
  tags: any;
  type: "way";
}

interface ParseRoadsResult {
  points: Point[];
  segments: Segment[];
}

export default class OSM {
  public viewPort: ViewPort;
  public world: World;

  constructor(viewPort: ViewPort, world: World) {
    this.viewPort = viewPort;
    this.world = world;
  }

  /**
   * Retrieves data from the OpenStreetMap API and parses it into road elements.
   * @param options - The options for creating the request body.
   * @returns A promise that resolves to the parsed road elements.
   */
  public async getData(options: CreateBodyOptions): Promise<ParseRoadsResult> {
    const method = "POST";
    const body = this.#createBody(options);
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const data = await fetch("https://overpass-api.de/api/interpreter?", { method, body, headers }).catch((err) => {
      console.log(err);
    });
    const result: Promise<{ elements: (OsmNode | OsmWay)[] }> = await data?.json();
    return this.#parseRoads(result, options.scale, options.distanceThreshold);
  }

  /**
   * Creates the body for the OSM query based on the provided options.
   * @param options - The options for creating the body.
   * @returns The body for the OSM query.
   */
  #createBody(options: CreateBodyOptions) {
    const bb = boundingBox(options.lat, options.lon, options.distance);
    const bbString = `[bbox:${bb.latMin},${bb.lonMin},${bb.latMax},${bb.lonMax}]\n`;
    const outJSON = "[out:json]\n";
    const timeout = `[timeout:${options.timeOut}]\n;\n`;
    const highwayMotorway = options.motorway ? `\t['highway'='motorway']` : "";
    const highwayTrunk = options.trunk ? `\t['highway'='trunk']` : "";
    const highwayPrimary = options.primary ? `\t['highway'='primary']` : "";
    const highwaySecondary = options.secondary ? `\t['highway'='secondary']` : "";
    const highwayTertiary = options.tertiary ? `\t['highway'='tertiary']` : "";
    const query = `way\n${highwayMotorway}${highwayTrunk}${highwayPrimary}${highwaySecondary}${highwayTertiary};\n`;
    const outBody = "out body;\n";
    const outSkeleton = "out skel;\n";
    const recurseDown = ">;\n";
    const body = `${bbString}${outJSON}${timeout}(\n${query});\n${outBody}${recurseDown}${outSkeleton}`;
    return body;
  }

  /**
   * Parses the road data and returns the result.
   * @param data - The road data to parse.
   * @param scaleX - The scale factor for the X-axis. Default is 600.
   * @param scaleY - The scale factor for the Y-axis. Default is 600.
   * @returns The result of parsing the road data.
   */
  #parseRoads(data: any, scale: number = 1, distanceThreshold: number = 50): ParseRoadsResult {
    // extract the nodes from the response data
    const nodes: OsmNode[] = data.elements.filter((e: any) => e.type === "node" && !isNaN(e.lat) && !isNaN(e.lon));
    //calculate the bounding box in order to transform lat/lon to x/y
    const latMin = Math.min(...nodes.map((n: any) => n.lat));
    const lonMin = Math.min(...nodes.map((n: OsmNode) => n.lon));
    const latMax = Math.max(...nodes.map((n: any) => n.lat));
    const lonMax = Math.max(...nodes.map((n: OsmNode) => n.lon));
    const nodeDict: { [key: number]: Point } = {}; // this keeps the points
    const nodeUsed: { [key: number]: boolean } = {}; // this marks if a point has been used or not.
    // transform lat/lon to x/y
    const bb = { latMax, latMin, lonMax, lonMin };
    nodes.forEach((n: OsmNode) => {
      const { x, y } = latLonToScreenXY(n.lat, n.lon, bb, scale);
      nodeDict[n.id] = new Point(x, y);
    }); // the nodes are now in XY coordinates
    // get the nodes that are used in the ways
    const ways: OsmWay[] = data.elements.filter((e: any) => e.type === "way" && e.nodes.length > 1);
    const segments: Segment[] = [];
    // loop through the ways and create segments
    for (const way of ways) {
      const points: Point[] = way.nodes.map((n: number) => nodeDict[n]);
      const oneWay: boolean = way.tags.oneway || way.tags.lanes == 1;
      let lastEntry = 0;
      for (let i = 1; i < points.length - 1; i++) {
        const distance = Point.getDistance(points[lastEntry], points[i]);
        if (distance >= distanceThreshold) {
          segments.push(new Segment(points[lastEntry], points[i], oneWay));
          nodeUsed[way.nodes[i]] = true;
          if (lastEntry == 0) nodeUsed[way.nodes[0]] = true; // we found a legit segment so we add the first point too.
          lastEntry = i;
        }
      }
    }
    // get only used points
    return {
      segments,
      points: Object.keys(nodeUsed).map((key) => nodeDict[+key]),
    };
  }
}
