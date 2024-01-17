import UI from "./ui/ui";

const carCanvas: HTMLCanvasElement = getCanvas("worldCanvas", window.innerWidth - 330, window.innerHeight);
const netCanvas: HTMLCanvasElement = getCanvas("networkCanvas", 330, window.innerHeight - 300);
const miniMapCanvas: HTMLCanvasElement = getCanvas("miniMapCanvas", 330, 300);

function getCanvas(id: string, width: number, height: number): HTMLCanvasElement {
  const canvas = document.getElementById(id) as HTMLCanvasElement;
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

const ui = new UI(carCanvas, netCanvas, miniMapCanvas);
ui.start.bind(ui)();
