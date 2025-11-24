import { Camera } from './camera';
import { Plane } from './mesh';

export class Stage {
  camera: Camera;
  groundPlane: Plane;

  constructor(camera: Camera, mesh: Plane) {
    this.camera = camera;
    this.groundPlane = mesh;
  }
}
