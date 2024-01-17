# A virtual world - self driving car

This is a typescript implementation of the amazing course by Radu Mariescu-Istodor
The course can be found [here](https://www.youtube.com/watch?v=wH2aNJxltus&list=PLB0Tybl0UNfYoJE7ZwsBQoDIG4YN9ptyY&index=1)

### Changes from the original code

1. Using typescript
2. SDC and Editor are unified and can be toggled.
3. The Driving mode is just like an editor and implements the Editor interface (enable, disable and display functions)
4. OpenPassAPI is quired from the code. We provide the center of the map we want to explore
5. The map is saved in a file and then can be loaded from disk. The work is done in a background worker.
6. Minimap and NetworkMap are a separate UI module. Trying to remove dependence on constructor variables that can get out of sync when the reference is lost.
7. A generate on/off button to stop world generation to make editing faster.
8. Added bounded box intersection logic. This speeds up things a lot, especially in editing mode.
9. Changed logic to detect if a point is inside a polygon or outside, based on the article [here](https://www.baeldung.com/cs/geofencing-point-inside-polygon). Its much faster and computationally less expensive.
