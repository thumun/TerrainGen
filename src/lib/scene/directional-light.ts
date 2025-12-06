import { mat4, vec3, type Vec3 } from 'wgpu-matrix';

import * as common from '@/lib/renderers/common';
import * as instancer from '@/lib/renderers/pipelines/instancer';
import type * as mesh from '@/lib/scene/mesh';
import * as shaders from '@/lib/shaders/shaders';
import type { WebGPUContext } from '@/lib/webgpu-context';

export class DirectionalLight {
  // Static config
  private static readonly NearPlane = 0.0;
  private static readonly FarPlane = 50;
  private static readonly OrthographicSize = 25;

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

  private readonly uniformsBindGroup: GPUBindGroup;

  private readonly shadowDepthTextureView: GPUTextureView;
  private readonly shadowPipeline: GPURenderPipeline;
  private readonly shadowPipelineInstanced: GPURenderPipeline;

  public constructor(
    webGPU: WebGPUContext,
    options: { depthTextureSize?: number; lightDirection?: Vec3; lightTarget?: Vec3 } = {},
  ) {
    const { device } = webGPU;
    const {
      depthTextureSize = 2048,
      lightDirection = vec3.fromValues(0.2, 0.3, 0.1),
      lightTarget,
    } = options;

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
    this.setLightDirection(device, { direction: lightDirection, target: lightTarget });

    // ----------------------------------------------------------------------------------------
    // ------ Initialize layouts
    // ----------------------------------------------------------------------------------------

    const uniformsBindGroupLayout = device.createBindGroupLayout({
      label: 'uniform bind group layout',
      entries: [
        {
          binding: 0, // directionalLightUniforms
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: 'uniform' },
        },
      ],
    });

    const instancePointsBindGroupLayout = device.createBindGroupLayout({
      label: 'instance points bind group layout',
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: 'read-only-storage' },
        },
      ],
    });

    this.uniformsBindGroup = device.createBindGroup({
      label: 'directional light uniforms bind group',
      layout: uniformsBindGroupLayout,
      entries: [
        {
          binding: 0, // directionalLightUniforms
          resource: this.directionalLightUniformsBuffer,
        },
      ],
    });

    const shadowPipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [uniformsBindGroupLayout],
    });

    const shadowPipelineLayoutInstanced = device.createPipelineLayout({
      bindGroupLayouts: [uniformsBindGroupLayout, instancePointsBindGroupLayout],
    });

    // ----------------------------------------------------------------------------------------
    // ------ Initialize pipeline
    // ----------------------------------------------------------------------------------------

    this.shadowPipeline = device.createRenderPipeline({
      layout: shadowPipelineLayout,
      vertex: {
        module: device.createShaderModule({
          code: shaders.shadowCastVertSrc,
        }),
        buffers: [common.VERTEX_BUFFER_LAYOUT],
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: 'less',
        format: 'depth32float',
      },
    });

    this.shadowPipelineInstanced = device.createRenderPipeline({
      layout: shadowPipelineLayoutInstanced,
      vertex: {
        module: device.createShaderModule({
          code: shaders.shadowCastVertSrc,
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

  /**
   * Updates uniforms based on a vector direction towards an incoming light.
   */
  public setLightDirection(device: GPUDevice, options: { direction: Vec3; target?: Vec3 }) {
    const { direction, target = vec3.fromValues(0, 0, 0) } = options;

    const desiredLightDistance =
      (DirectionalLight.FarPlane - DirectionalLight.NearPlane) / 2 + DirectionalLight.NearPlane;
    const lightDirection = vec3.normalize(direction);
    const lightOffset = vec3.mulScalar(lightDirection, desiredLightDistance);
    const lightPos = vec3.add(target, lightOffset);

    const lightViewMatrix = mat4.lookAt(lightPos, target, vec3.fromValues(0, 1, 0));
    const lightProjectionMatrix = mat4.create();
    {
      const left = -DirectionalLight.OrthographicSize;
      const right = DirectionalLight.OrthographicSize;
      const bottom = -DirectionalLight.OrthographicSize;
      const top = DirectionalLight.OrthographicSize;
      const near = DirectionalLight.NearPlane;
      const far = DirectionalLight.FarPlane;
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

  private static readonly ENABLE_INSTANCE_SHADOWS = false;

  /**
   * Runs a render pass filling out the depth texture associated with
   * `this.shadowDepthTextureView`.
   */
  public onFrame({
    encoder,
    meshes,
    instancers,
  }: {
    encoder: GPUCommandEncoder;
    meshes: mesh.Mesh[];
    instancers: instancer.IndirectInstancer[];
  }) {
    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [],
      depthStencilAttachment: {
        view: this.shadowDepthTextureView,
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    };

    {
      const shadowPass = encoder.beginRenderPass(renderPassDescriptor);
      shadowPass.setPipeline(this.shadowPipeline);
      shadowPass.setBindGroup(0, this.uniformsBindGroup);

      meshes.forEach((mesh) => {
        if (!mesh.indexBuffer) {
          console.warn('Mesh index buffer not set up for mesh', mesh);
          return;
        }
        if (!mesh.indirectBuffer) {
          console.warn('Mesh indirect buffer not set up for mesh', mesh);
          return;
        }

        shadowPass.setVertexBuffer(0, mesh.vertexBuffer);
        shadowPass.setIndexBuffer(mesh.indexBuffer, 'uint32');
        shadowPass.drawIndexedIndirect(mesh.indirectBuffer, 0);
      });

      shadowPass.end();
    }

    if (DirectionalLight.ENABLE_INSTANCE_SHADOWS) {
      const instancedShadowPass = encoder.beginRenderPass(renderPassDescriptor);
      instancedShadowPass.setPipeline(this.shadowPipelineInstanced);
      instancedShadowPass.setBindGroup(0, this.uniformsBindGroup);

      instancers.forEach((instancer) => {
        instancedShadowPass.setBindGroup(1, instancer.instancingPointsBindGroup);
        instancedShadowPass.drawIndirect(instancer.indirectInstanceBuffer, 0);
      });

      instancedShadowPass.end();
    }
  }
}
