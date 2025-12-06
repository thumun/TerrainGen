import { mat4, vec3, type Vec3 } from 'wgpu-matrix';

import * as common from '@/lib/renderers/common';
import { shadowCastVertSrc } from '@/lib/shaders/shaders';
import type { WebGPUContext } from '@/lib/webgpu-context';

export class DirectionalLight {
  // Static config
  private static readonly NearPlane = 0.0;
  private static readonly FarPlane = 200;
  private static readonly OrthographicSize = 400;

  private static readonly DirectionalLightUniformsByteSize = 80;

  // Uniforms
  private readonly directionalLightUniformsBuffer: GPUBuffer;

  private readonly directionalLightUniformsValues = new ArrayBuffer(
    DirectionalLight.DirectionalLightUniformsByteSize,
  );
  private readonly directionalLightUniformsViews = {
    lightViewProjMatrix: new Float32Array(this.directionalLightUniformsValues, 0, 16),
    lightPos: new Float32Array(this.directionalLightUniformsValues, 64, 3),
  };

  // @ts-expect-error TODO: eventually we will read this!
  private readonly shadowDepthTextureView: GPUTextureView;
  // @ts-expect-error TODO: eventually we will read this!
  private readonly shadowPipeline: GPURenderPipeline;

  public constructor(webGPU: WebGPUContext, options: { depthTextureSize?: number } = {}) {
    const { device } = webGPU;
    const { depthTextureSize = 2048 } = options;

    // ----------------------------------------------------------------------------------------
    // ------ Initialize buffers
    // ----------------------------------------------------------------------------------------

    const shadowDepthTexture = device.createTexture({
      size: [depthTextureSize, depthTextureSize, 1],
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      format: 'depth32float',
    });
    this.shadowDepthTextureView = shadowDepthTexture.createView();

    /** Holds struct DirectionalLightUniforms (found in common.wgsl) */
    this.directionalLightUniformsBuffer = device.createBuffer({
      label: 'directional light uniforms buffer',
      size: 80,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // ----------------------------------------------------------------------------------------
    // ------ Initialize layouts
    // ----------------------------------------------------------------------------------------

    const uniformsBufferLayout = device.createBindGroupLayout({
      label: 'uniform bind group layout',
      entries: [
        {
          binding: 0, // directionalLightUniforms
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: 'uniform' },
        },
      ],
    });

    const shadowPipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [uniformsBufferLayout],
    });

    // ----------------------------------------------------------------------------------------
    // ------ Initialize pipeline
    // ----------------------------------------------------------------------------------------

    this.shadowPipeline = device.createRenderPipeline({
      layout: shadowPipelineLayout,
      vertex: {
        module: device.createShaderModule({
          code: shadowCastVertSrc,
        }),
        buffers: [common.VERTEX_BUFFER_LAYOUT],
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: 'less',
        format: 'depth32float',
      },
    });
  }

  private static readonly UpVector = vec3.fromValues(0, 1, 0);
  private static readonly DefaultTarget = vec3.fromValues(0, 0, 0);

  /**
   * Updates uniforms
   */
  public setLightDirection(device: GPUDevice, options: { direction: Vec3; target?: Vec3 }) {
    const { direction, target = DirectionalLight.DefaultTarget } = options;

    const desiredLightDistance =
      (DirectionalLight.FarPlane - DirectionalLight.NearPlane) / 2 + DirectionalLight.NearPlane;
    const lightDirection = vec3.normalize(direction);
    const lightOffset = vec3.mulScalar(lightDirection, desiredLightDistance);
    const lightPos = vec3.add(target, lightOffset);

    const lightViewMatrix = mat4.lookAt(lightPos, target, DirectionalLight.UpVector);
    const lightProjectionMatrix = mat4.create();
    {
      const left = -DirectionalLight.OrthographicSize;
      const right = DirectionalLight.OrthographicSize;
      const bottom = -DirectionalLight.OrthographicSize;
      const top = DirectionalLight.OrthographicSize;
      const near = -DirectionalLight.OrthographicSize;
      const far = DirectionalLight.OrthographicSize;
      mat4.ortho(left, right, bottom, top, near, far, lightProjectionMatrix);
    }
    const lightViewProjMatrix = mat4.multiply(lightProjectionMatrix, lightViewMatrix);

    // copy to our ArrayBuffer
    this.directionalLightUniformsViews.lightViewProjMatrix.set(lightViewProjMatrix);
    this.directionalLightUniformsViews.lightPos.set(lightPos);

    // copy from host to device
    device.queue.writeBuffer(
      this.directionalLightUniformsBuffer,
      0,
      this.directionalLightUniformsValues,
    );
  }

  // TODO: implement this based on existing render logic
  // public doShadowMapping({ meshes }: { meshes: Mesh[] }) {
  //   meshes.forEach((mesh) => {
  //
  //   });
  // }
}
