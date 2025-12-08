import type { Camera } from './camera';
import type { DirectionalLight } from './directional-light';
import type { Plane } from './mesh';

export class Stage {
  readonly camera: Camera;
  readonly directionalLight: DirectionalLight;
  readonly groundPlane: Plane;

  constructor(camera: Camera, directionalLight: DirectionalLight, mesh: Plane) {
    this.camera = camera;
    this.directionalLight = directionalLight;
    this.groundPlane = mesh;
  }
}
