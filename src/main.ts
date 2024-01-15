import CrossingEditor from "./editors/crossingEditor";
import Editor from "./editors/editor";
import GraphEditor from "./editors/graphEditor";
import LightEditor from "./editors/lightEditor";
import ParkingEditor from "./editors/parkingEditor";
import StartEditor from "./editors/startEditor";
import StopEditor from "./editors/stopEditor";
import TargetEditor from "./editors/targetEditor";
import YieldEditor from "./editors/yieldEditor";
import Graph from "./math/graph";
import Point from "./primitives/point";
import ViewPort from "./viewPort";
import World from "./world";

interface Tools {
  [key: string]: { button: HTMLButtonElement; editor: Editor | null };
}
type Mode = "graph" | "stop" | "crossing" | "start" | "parking" | "light" | "target" | "yield";

const myCanvas: HTMLCanvasElement = getCanvas("myCanvas", 800, 600);
const world = load();
const viewPort = new ViewPort(myCanvas, world.zoom, world.offset);
const tools = prepareTools(viewPort, world.graph, world);
let currentMode: Mode = "graph";
let oldGraphHash = world.graph.hash();

setMode(currentMode);
requestAnimationFrame(animate);

function animate(timestamp: number) {
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
  requestAnimationFrame(animate);
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

function prepareTools(viewPort: ViewPort, graph: Graph, world: World): Tools {
  const tools: Tools = {
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
