import { Camera } from './camera';
import { Plane } from './mesh';

export class Stage {
  readonly camera: Camera;
  readonly groundPlane: Plane;
  readonly waterPlane: Plane;

  constructor(camera: Camera, mesh: Plane, water: Plane) {
    this.camera = camera;
    this.groundPlane = mesh;
    this.waterPlane = water;
  }
}
