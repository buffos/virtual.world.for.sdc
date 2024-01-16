import CrossingEditor from "./world/editors/crossingEditor";
import Editor from "./world/editors/editor";
import GraphEditor from "./world/editors/graphEditor";
import LightEditor from "./world/editors/lightEditor";
import ParkingEditor from "./world/editors/parkingEditor";
import StartEditor from "./world/editors/startEditor";
import StopEditor from "./world/editors/stopEditor";
import TargetEditor from "./world/editors/targetEditor";
import YieldEditor from "./world/editors/yieldEditor";
import Graph from "./math/graph";
import Point from "./world/primitives/point";
import ViewPort from "./world/viewPort";
import World from "./world/world";
import Visualizer from "./car/visualizer";
import CarWorld from "./car/carWorld";

interface Tools {
  [key: string]: { button: HTMLButtonElement; editor: Editor | null };
}
type Mode = "drive" | "graph" | "stop" | "crossing" | "start" | "parking" | "light" | "target" | "yield";

const carCanvas: HTMLCanvasElement = getCanvas("worldCanvas", window.innerWidth - 330, window.innerHeight);
const netCanvas: HTMLCanvasElement = getCanvas("networkCanvas", 330, window.innerHeight);
const networkCtx = netCanvas.getContext("2d") as CanvasRenderingContext2D;
const world = load();
const viewPort = new ViewPort(carCanvas, world.zoom, world.offset);
const tools = prepareWorldTools(viewPort, world.graph, world);
let currentMode: Mode = "graph";
let oldGraphHash = world.graph.hash();

setMode(currentMode);
const carWorld = tools["drive"].editor as CarWorld;
world.setCarWorld(carWorld);

requestAnimationFrame(animate);

function animate(timestamp: number) {
  viewPort.offset.x = -carWorld.getBestCar().center.x;
  viewPort.offset.y = -carWorld.getBestCar().center.y;
  animateWorld(timestamp);
  animateCarWorld(timestamp);
  animateNeuralNetwork(timestamp);
  requestAnimationFrame(animate);
}

function animateCarWorld(_: number) {
  carWorld.update(world);
}

function animateNeuralNetwork(timestamp: number) {
  networkCtx.lineDashOffset = -timestamp / 50;
  networkCtx.clearRect(0, 0, netCanvas.width, netCanvas.height);
  Visualizer.drawNetwork(networkCtx, carWorld.getBestCarBrain());
}

function animateWorld(timestamp: number) {
  viewPort.reset();
  if (world.graph.hash() != oldGraphHash) {
    world.generate();
    oldGraphHash = world.graph.hash();
  }
  const viewPoint = Point.scaleVector(viewPort.getOffset(), -1);
  world.update(timestamp);
  world.draw(viewPort.ctx, viewPoint);
  viewPort.ctx.globalAlpha = 0.3;
  tools[currentMode].editor?.display();
}

function disableEditors() {
  for (const tool of Object.values(tools)) {
    tool.button.style.backgroundColor = "gray";
    tool.button.style.filter = "grayscale(100%)";
    tool.editor?.disable();
  }
}

function dispose() {
  (tools["graph"].editor as GraphEditor)?.dispose();
  world.markings.length = 0;
}

function getCanvas(id: string, width: number, height: number): HTMLCanvasElement {
  const canvas = document.getElementById(id) as HTMLCanvasElement;
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function load(): World {
  return World.load("world");
}

function loadFromFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.item(0);
  if (!file) {
    location.reload();
    return;
  }
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = () => {
    // const worldData = JSON.parse(reader.result as string);
    const worldData = reader.result as string;
    window.localStorage.setItem("world", worldData);
    location.reload();
  };
}

function prepareWorldTools(viewPort: ViewPort, graph: Graph, world: World): Tools {
  const tools: Tools = {
    drive: { button: document.getElementById("btnDrive") as HTMLButtonElement, editor: new CarWorld(viewPort, world, { NoOfCars: 100 }) },
    graph: { button: document.getElementById("btnGraphics") as HTMLButtonElement, editor: new GraphEditor(viewPort, graph) },
    stop: { button: document.getElementById("btnStop") as HTMLButtonElement, editor: new StopEditor(viewPort, world) },
    crossing: { button: document.getElementById("btnCross") as HTMLButtonElement, editor: new CrossingEditor(viewPort, world) },
    start: { button: document.getElementById("btnStart") as HTMLButtonElement, editor: new StartEditor(viewPort, world) },
    parking: { button: document.getElementById("btnParking") as HTMLButtonElement, editor: new ParkingEditor(viewPort, world) },
    light: { button: document.getElementById("btnLight") as HTMLButtonElement, editor: new LightEditor(viewPort, world) },
    target: { button: document.getElementById("btnTarget") as HTMLButtonElement, editor: new TargetEditor(viewPort, world) },
    yield: { button: document.getElementById("btnYield") as HTMLButtonElement, editor: new YieldEditor(viewPort, world) },
  };
  document.getElementById("btnDispose")?.addEventListener("click", () => dispose());
  document.getElementById("btnSave")?.addEventListener("click", () => save(viewPort, world));
  document.getElementById("fileInput")?.addEventListener("change", (event) => loadFromFile(event));
  tools["drive"].button?.addEventListener("click", () => setMode("drive"));
  tools["graph"].button?.addEventListener("click", () => setMode("graph"));
  tools["stop"].button?.addEventListener("click", () => setMode("stop"));
  tools["yield"].button?.addEventListener("click", () => setMode("yield"));
  tools["crossing"].button?.addEventListener("click", () => setMode("crossing"));
  tools["parking"].button?.addEventListener("click", () => setMode("parking"));
  tools["light"].button?.addEventListener("click", () => setMode("light"));
  tools["start"].button?.addEventListener("click", () => setMode("start"));
  tools["target"].button?.addEventListener("click", () => setMode("target"));
  return tools;
}

function save(viewPort: ViewPort, world: World) {
  world.zoom = viewPort.zoom;
  world.offset = viewPort.offset;
  const element = document.createElement("a");
  element.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(world)));
  const filename = "name.world";
  element.setAttribute("download", filename);
  element.click();
  world.saveToLocalStorage("world");
}

function setMode(mode: Mode) {
  disableEditors();
  tools[mode].button.style.backgroundColor = "white";
  tools[mode].button.style.filter = "";
  tools[mode].editor?.enable();
  currentMode = mode;
}
