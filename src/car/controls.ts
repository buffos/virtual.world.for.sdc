import { ControlType } from "../models/carTypes";

export default class Controls {
  forward: boolean;
  left: boolean;
  right: boolean;
  reverse: boolean;
  constructor(controlType: ControlType) {
    this.forward = false;
    this.left = false;
    this.right = false;
    this.reverse = false;

    switch (controlType) {
      case "KEYS":
        this.#addKeyboardListeners();
        break;
      case "DUMMY":
        this.forward = true;
        break;
    }
  }

  /**
   * Adds keyboard event listeners to control the car's movements.
   */
  #addKeyboardListeners(): void {
    document.addEventListener("keydown", (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          this.left = true;
          break;
        case "ArrowRight":
          this.right = true;
          break;
        case "ArrowUp":
          this.forward = true;
          break;
        case "ArrowDown":
          this.reverse = true;
          break;
      }
    });

    document.addEventListener("keyup", (event) => {
      switch (event.key) {
        case "ArrowLeft":
          this.left = false;
          break;
        case "ArrowRight":
          this.right = false;
          break;
        case "ArrowUp":
          this.forward = false;
          break;
        case "ArrowDown":
          this.reverse = false;
          break;
      }
    });
  }
}
