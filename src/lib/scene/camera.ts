/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Mat4, mat4, type Vec3, vec3, vec4 } from 'wgpu-matrix';

import type { WebGPUContext } from '@/lib/webgpu-context';

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

class CameraUniforms {
  readonly buffer = new ArrayBuffer(320);
  private readonly floatView = new Float32Array(this.buffer, 0, 16);
  private readonly invProjMatView = new Float32Array(this.buffer, 64, 16);
  private readonly viewMatView = new Float32Array(this.buffer, 128, 16);
  private readonly invViewMatView = new Float32Array(this.buffer, 192, 16);
  private readonly viewDirView = new Float32Array(this.buffer, 256, 4);
  private readonly cameraWidthView = new Float32Array(this.buffer, 272, 1);
  private readonly cameraHeightView = new Float32Array(this.buffer, 276, 1);
  private readonly nearPlaneView = new Float32Array(this.buffer, 280, 1);
  private readonly farPlaneView = new Float32Array(this.buffer, 284, 1);
  private readonly timeView = new Float32Array(this.buffer, 288, 1);
  private readonly fogIntensityView = new Float32Array(this.buffer, 292, 1);
  private readonly fogColorView = new Float32Array(this.buffer, 304, 3);

  set viewProjMat(mat: Float32Array) {
    this.floatView.set(mat.subarray(0, 16), 0);
  }

  set invProjMat(mat: Float32Array) {
    this.invProjMatView.set(mat.subarray(0, 16), 0);
  }

  set viewMat(mat: Float32Array) {
    this.viewMatView.set(mat.subarray(0, 16), 0);
  }

  set invViewMat(mat: Float32Array) {
    this.invViewMatView.set(mat.subarray(0, 16), 0);
  }

  set viewDir(dir: Float32Array) {
    this.viewDirView.set(dir.subarray(0, 4), 0);
  }

  // width and height of camera
  set cameraWidth(width: number) {
    this.cameraWidthView[0] = width;
  }
  set cameraHeight(height: number) {
    this.cameraHeightView[0] = height;
  }

  // near and far plane
  set nearPlane(near: number) {
    this.nearPlaneView[0] = near;
  }
  set farPlane(far: number) {
    this.farPlaneView[0] = far;
  }

  set time(time: number) {
    this.timeView[0] = time;
  }

  set fogIntensity(intensity: number) {
    this.fogIntensityView[0] = intensity;
  }

  set fogColor(color: [number, number, number]) {
    this.fogColorView.set(color);
  }
}

export class Camera {
  uniforms: CameraUniforms = new CameraUniforms();
  uniformsBuffer: GPUBuffer;

  projMat: Mat4 = mat4.create();
  cameraPos: Vec3 = vec3.create(-7, 2, 0);
  cameraFront: Vec3 = vec3.create(0, 0, -1);
  cameraUp: Vec3 = vec3.create(0, 1, 0);
  cameraRight: Vec3 = vec3.create(1, 0, 0);
  yaw: number = 0;
  pitch: number = 0;
  moveSpeed: number = 0.004;
  sensitivity: number = 0.15;
  time: number = 0;

  static readonly nearPlane = 0.1;
  static readonly farPlane = 1000;

  keys: { [key: string]: boolean } = {};

  device: GPUDevice;
  canvas: HTMLCanvasElement;
  fovYDegrees: number = 45;
  aspectRatio: number;

  constructor(webGPU: WebGPUContext) {
    // save information from webgpu context
    this.device = webGPU.device;
    this.canvas = webGPU.canvas;
    this.aspectRatio = webGPU.aspectRatio;

    // create buffer for camera uniforms on device
    this.uniformsBuffer = this.device.createBuffer({
      label: 'uniforms',
      size: this.uniforms.buffer.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // projection matrix
    this.projMat = mat4.perspective(
      toRadians(this.fovYDegrees),
      this.aspectRatio,
      Camera.nearPlane,
      Camera.farPlane,
    );

    // inverse projection matrix
    this.uniforms.invProjMat = mat4.inverse(this.projMat);

    // screen size
    this.uniforms.cameraWidth = this.canvas.width;
    this.uniforms.cameraHeight = this.canvas.height;

    // near/far plane
    this.uniforms.nearPlane = Camera.nearPlane;
    this.uniforms.farPlane = Camera.farPlane;

    this.rotateCamera(0, 0); // set initial camera vectors

    window.addEventListener('keydown', (event) => this.onKeyEvent(event, true));
    window.addEventListener('keyup', (event) => this.onKeyEvent(event, false));
    window.onblur = () => (this.keys = {}); // reset keys on page exit so they don't get stuck (e.g. on alt + tab)

    this.canvas.addEventListener('mousedown', () => this.canvas.requestPointerLock());
    this.canvas.addEventListener('mouseup', () => document.exitPointerLock());
    this.canvas.addEventListener('mousemove', (event) => this.onMouseMove(event));
  }

  private onKeyEvent(event: KeyboardEvent, down: boolean) {
    this.keys[event.key.toLowerCase()] = down;
    if (this.keys['alt']) {
      // prevent issues from alt shortcuts
      event.preventDefault();
    }
  }

  private rotateCamera(dx: number, dy: number) {
    this.yaw += dx;
    this.pitch -= dy;

    if (this.pitch > 89) {
      this.pitch = 89;
    }
    if (this.pitch < -89) {
      this.pitch = -89;
    }

    const front = mat4.create();
    front[0] = Math.cos(toRadians(this.yaw)) * Math.cos(toRadians(this.pitch));
    front[1] = Math.sin(toRadians(this.pitch));
    front[2] = Math.sin(toRadians(this.yaw)) * Math.cos(toRadians(this.pitch));

    this.cameraFront = vec3.normalize(front);
    this.cameraRight = vec3.normalize(vec3.cross(this.cameraFront, [0, 1, 0]));
    this.cameraUp = vec3.normalize(vec3.cross(this.cameraRight, this.cameraFront));
  }

  private onMouseMove(event: MouseEvent) {
    if (document.pointerLockElement === this.canvas) {
      this.rotateCamera(event.movementX * this.sensitivity, event.movementY * this.sensitivity);
    }
  }

  private processInput(deltaTime: number) {
    let moveDir = vec3.create(0, 0, 0);
    if (this.keys['w']) {
      moveDir = vec3.add(moveDir, this.cameraFront);
    }
    if (this.keys['s']) {
      moveDir = vec3.sub(moveDir, this.cameraFront);
    }
    if (this.keys['a']) {
      moveDir = vec3.sub(moveDir, this.cameraRight);
    }
    if (this.keys['d']) {
      moveDir = vec3.add(moveDir, this.cameraRight);
    }
    if (this.keys['q']) {
      moveDir = vec3.sub(moveDir, this.cameraUp);
    }
    if (this.keys['e']) {
      moveDir = vec3.add(moveDir, this.cameraUp);
    }

    let moveSpeed = this.moveSpeed * deltaTime;
    const moveSpeedMultiplier = 3;
    if (this.keys['shift']) {
      moveSpeed *= moveSpeedMultiplier;
    }
    if (this.keys['alt']) {
      moveSpeed /= moveSpeedMultiplier;
    }

    if (vec3.length(moveDir) > 0) {
      const moveAmount = vec3.scale(vec3.normalize(moveDir), moveSpeed);
      this.cameraPos = vec3.add(this.cameraPos, moveAmount);
    }
  }

  onFrame(deltaTime: number) {
    this.processInput(deltaTime);

    this.time += deltaTime / 1000.0;

    const lookPos = vec3.add(this.cameraPos, vec3.scale(this.cameraFront, 1));
    const viewMat = mat4.lookAt(this.cameraPos, lookPos, [0, 1, 0]);
    const viewProjMat = mat4.mul(this.projMat, viewMat);

    // set `this.uniforms.viewProjMat` to the newly calculated view proj mat
    this.uniforms.viewProjMat = viewProjMat;

    // set view dir
    this.uniforms.viewDir = vec4.create(
      this.cameraFront.at(0),
      this.cameraFront.at(1),
      this.cameraFront.at(2),
      1.0,
    );

    // write to extra buffers needed for light clustering here
    this.uniforms.viewMat = viewMat;
    this.uniforms.invViewMat = mat4.inverse(viewMat);

    this.uniforms.time = this.time;

    // upload `this.uniforms.buffer` (host side) to `this.uniformsBuffer` (device side)
    this.device.queue.writeBuffer(this.uniformsBuffer, 0, this.uniforms.buffer);
  }
}
