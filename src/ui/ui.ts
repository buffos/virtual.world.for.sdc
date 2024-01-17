import Editor from "../world/editors/editor";
import Graph from "../world/math/graph";
import World from "../world/world";
import CarWorld from "../car/carWorld";
import GraphEditor from "../world/editors/graphEditor";
import ViewPort from "../world/viewPort";
import OSM from "../world/math/osm";
import Visualizer from "../car/visualizer";
import Point from "../world/primitives/point";
import CrossingEditor from "../world/editors/crossingEditor";
import StartEditor from "../world/editors/startEditor";
import LightEditor from "../world/editors/lightEditor";
import ParkingEditor from "../world/editors/parkingEditor";
import StopEditor from "../world/editors/stopEditor";
import TargetEditor from "../world/editors/targetEditor";
import YieldEditor from "../world/editors/yieldEditor";
import NetworkMap from "./networkMap";
import MiniMap from "./minimap";

type Mode = "drive" | "graph" | "stop" | "crossing" | "start" | "parking" | "light" | "target" | "yield";

interface Tools {
  [key: string]: { button: HTMLButtonElement; editor: Editor | null };
}

interface UIOptions {
  minimapSize?: number;
}

export default class UI {
  private carWorld: CarWorld;
  private currentMode: Mode = "graph";
  private generate: boolean;
  private miniMap: MiniMap;
  private networkMap: NetworkMap;
  private oldGraphHash: string = "";
  private tools: Tools;
  private viewPort: ViewPort;
  private world: World;

  constructor(carCanvas: HTMLCanvasElement, netCanvas: HTMLCanvasElement, miniMapCanvas: HTMLCanvasElement, { minimapSize = 300 }: UIOptions = {}) {
    this.world = this.#load();
    this.viewPort = new ViewPort(carCanvas, this.world.zoom, this.world.offset);
    this.currentMode = "graph";
    this.tools = this.#createWorldTools();
    this.#createToolListeners();
    this.carWorld = this.tools["drive"].editor as CarWorld;
    this.generate = true;
    this.networkMap = new NetworkMap(netCanvas);
    this.miniMap = new MiniMap(miniMapCanvas, minimapSize);
    this.init();
  }

  public init() {
    this.tools = this.#createWorldTools();
    this.oldGraphHash = this.world.graph.hash();
    this.currentMode = "graph";
    this.#setMode(this.currentMode);
    this.world.setCarWorld(this.carWorld);
    document.getElementById("btnGenerate")?.setAttribute("style", "background-color: " + (this.generate ? "green" : "red"));
  }

  /**
   * Loads data from a file and initializes the UI with the loaded data.
   * @param event - The event object triggered by the file input.
   */
  public loadFromFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.item(0);
    if (!file) {
      location.reload();
      return;
    }
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      const worldData = reader.result as string;
      this.world = World.load(worldData);
      this.init();
    };
  }

  /**
   * Starts the animation loop.
   */
  public start() {
    requestAnimationFrame(this.#animate.bind(this));
  }

  /**
   * Animates the UI based on the current mode.
   * If the current mode is "drive", it updates the viewPort offset based on the best car's center.
   * It also updates the world zoom based on the viewPort zoom.
   * Then it calls the necessary animation methods for the world, carWorld, neural network, and mini map.
   * Finally, it requests the next animation frame.
   * @param timestamp The current timestamp.
   */
  #animate(timestamp: number) {
    if (this.currentMode === "drive") {
      this.viewPort.offset.x = -this.carWorld.getBestCar().center.x;
      this.viewPort.offset.y = -this.carWorld.getBestCar().center.y;
    }
    this.world.zoom = this.viewPort.zoom;
    this.#animateWorld(timestamp);
    this.#animateCarWorld(timestamp);
    this.#animateNeuralNetwork(timestamp);
    this.#animateMiniMap(timestamp);
    requestAnimationFrame(this.#animate.bind(this));
  }

  /**
   * Updates the car world animation.
   *
   * @param _ The number of frames to animate.
   */
  #animateCarWorld(_: number) {
    this.carWorld.update(this.world);
  }

  /**
   * Animates the mini map.
   *
   * @param timestamp - The current timestamp.
   */
  #animateMiniMap(timestamp: number) {
    this.miniMap.animate(timestamp, this.world.graph, this.viewPort.viewPoint);
  }

  /**
   * Animates the neural network.
   *
   * @param timestamp - The current timestamp.
   */
  #animateNeuralNetwork(timestamp: number) {
    this.networkMap.animate(timestamp, this.carWorld.getBestCarBrain());
  }

  /**
   * Animates the world.
   *
   * @param timestamp - The current timestamp.
   */
  #animateWorld(timestamp: number) {
    this.viewPort.reset();
    if (this.world.graph.hash() != this.oldGraphHash && this.generate) {
      this.world.generate();
      this.oldGraphHash = this.world.graph.hash();
    }
    this.world.update(timestamp);
    this.world.draw(this.viewPort.ctx, this.viewPort.viewPoint);
    this.viewPort.ctx.globalAlpha = 0.3;
    this.tools[this.currentMode].editor?.display();
  }

  /**
   * Closes the OSM panel by hiding it.
   */
  #closeOsmPanel() {
    const osmPanel = document.getElementById("osmPanel") as HTMLDivElement;
    osmPanel.style.display = "none";
  }

  /**
   * Creates event listeners for the UI tools.
   */
  #createToolListeners(): void {
    document.getElementById("btnDispose")?.addEventListener("click", () => this.#dispose());
    document.getElementById("btnSave")?.addEventListener("click", () => this.#save());
    document.getElementById("fileInput")?.addEventListener("change", (event) => this.loadFromFile(event));
    document.getElementById("openOsmPanel")?.addEventListener("click", () => this.#openOsmPanel());
    document.getElementById("parseOsmData")?.addEventListener("click", () => this.#parseOsmData());
    document.getElementById("closeOsmPanel")?.addEventListener("click", () => this.#closeOsmPanel());
    document.getElementById("btnGenerate")?.addEventListener("click", () => this.#toggleGenerate());

    this.tools["drive"].button?.addEventListener("click", () => this.#setMode("drive"));
    this.tools["graph"].button?.addEventListener("click", () => this.#setMode("graph"));
    this.tools["stop"].button?.addEventListener("click", () => this.#setMode("stop"));
    this.tools["yield"].button?.addEventListener("click", () => this.#setMode("yield"));
    this.tools["crossing"].button?.addEventListener("click", () => this.#setMode("crossing"));
    this.tools["parking"].button?.addEventListener("click", () => this.#setMode("parking"));
    this.tools["start"].button?.addEventListener("click", () => this.#setMode("start"));
    this.tools["target"].button?.addEventListener("click", () => this.#setMode("target"));
  }

  /**
   * Creates the world tools.
   * @returns The tools object containing buttons and editors.
   */
  #createWorldTools(): Tools {
    const tools: Tools = {
      drive: { button: document.getElementById("btnDrive") as HTMLButtonElement, editor: new CarWorld(this.viewPort, this.world, { NoOfCars: 100 }) },
      graph: { button: document.getElementById("btnGraphics") as HTMLButtonElement, editor: new GraphEditor(this.viewPort, this.world.graph) },
      stop: { button: document.getElementById("btnStop") as HTMLButtonElement, editor: new StopEditor(this.viewPort, this.world) },
      crossing: { button: document.getElementById("btnCross") as HTMLButtonElement, editor: new CrossingEditor(this.viewPort, this.world) },
      start: { button: document.getElementById("btnStart") as HTMLButtonElement, editor: new StartEditor(this.viewPort, this.world) },
      parking: { button: document.getElementById("btnParking") as HTMLButtonElement, editor: new ParkingEditor(this.viewPort, this.world) },
      light: { button: document.getElementById("btnLight") as HTMLButtonElement, editor: new LightEditor(this.viewPort, this.world) },
      target: { button: document.getElementById("btnTarget") as HTMLButtonElement, editor: new TargetEditor(this.viewPort, this.world) },
      yield: { button: document.getElementById("btnYield") as HTMLButtonElement, editor: new YieldEditor(this.viewPort, this.world) },
    };
    return tools;
  }

  /**
   * Disables all editors in the UI.
   */
  #disableEditors() {
    for (const tool of Object.values(this.tools)) {
      tool.button.style.backgroundColor = "gray";
      tool.button.style.filter = "grayscale(100%)";
      tool.editor?.disable();
    }
  }

  /**
   * Disposes the UI component.
   */
  #dispose() {
    (this.tools["graph"].editor as GraphEditor)?.dispose();
    this.world.markings.length = 0;
  }

  /**
   * Loads the world from local storage or creates a new world if no data is found.
   * @returns The loaded world.
   */
  #load() {
    const info = window.localStorage.getItem("world");
    if (!info) {
      return new World(new Graph([], []), { roadWidth: 100, roundness: 5 });
    }
    return World.load(info);
  }

  /**
   * Toggles the display of the OSM panel.
   */
  #openOsmPanel() {
    const osmPanel = document.getElementById("osmPanel") as HTMLDivElement;
    osmPanel.style.display = osmPanel.style.display == "none" ? "block" : "none";
  }

  /**
   * Parses OSM data based on the form input and generates a world file.
   * @private
   * @async
   */
  async #parseOsmData() {
    const osmData = document.getElementById("osmForm") as HTMLFormElement;
    const formData = new FormData(osmData);

    const options = {
      distance: formData.get("radius") as unknown as number,
      lat: formData.get("latitude") as unknown as number,
      lon: formData.get("longitude") as unknown as number,
      scale: formData.get("scale") as unknown as number,
      distanceThreshold: formData.get("distanceThreshold") as unknown as number,
      motorway: (formData.get("motorway") as unknown as boolean) ? true : false,
      primary: (formData.get("primary") as unknown as boolean) ? true : false,
      secondary: (formData.get("secondary") as unknown as boolean) ? true : false,
      tertiary: (formData.get("tertiary") as unknown as boolean) ? true : false,
      timeOut: 100,
      trunk: (formData.get("trunk") as unknown as boolean) ? true : false,
    };

    // const options2 = {
    //   distance: 3,
    //   lat: 50.1098861,
    //   lon: 8.7058685,
    //   motorway: true,
    //   primary: true,
    //   secondary: true,
    //   tertiary: false,
    //   timeOut: 100,
    //   trunk: true,
    //   scale: 1,
    //   distanceThreshold: 10,
    // };

    const osm = new OSM(this.viewPort, this.world);
    const data = await osm.getData(options);
    const worker = new Worker(new URL("./workerGenerateWorld.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (event) => {
      const element = document.createElement("a");
      element.setAttribute("href", "data:application/json;charset=utf-8," + event.data);
      const filename = "openWorld.world";
      element.setAttribute("download", filename);
      element.click();
      console.log("file saved");
    };
    worker.postMessage(data);
    this.#closeOsmPanel();
  }

  /**
   * Saves the current state of the world and downloads it as a JSON file.
   */
  #save() {
    this.world.zoom = this.viewPort.zoom;
    this.world.offset = this.viewPort.offset;
    const element = document.createElement("a");
    element.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.world)));
    const filename = "name.world";
    element.setAttribute("download", filename);
    element.click();
    this.world.saveToLocalStorage("world");
  }

  /**
   * Sets the mode of the UI.
   * @param mode The mode to set.
   */
  #setMode(mode: Mode) {
    this.#disableEditors();
    this.tools[mode].button.style.backgroundColor = "white";
    this.tools[mode].button.style.filter = "";
    this.tools[mode].editor?.enable(this.world);
    this.currentMode = mode;
  }

  /**
   * Toggles the generate flag and updates the style of the "btnGenerate" element accordingly.
   */
  #toggleGenerate() {
    this.generate = !this.generate;
    document.getElementById("btnGenerate")?.setAttribute("style", "background-color: " + (this.generate ? "green" : "red"));
  }
}
