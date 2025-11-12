import { Camera } from './camera';
import { Mesh } from './mesh';

export class Stage {
  camera: Camera;
  mesh: Mesh;

  constructor(camera: Camera, mesh: Mesh) {
    this.camera = camera;
    this.mesh = mesh;
  }
}
