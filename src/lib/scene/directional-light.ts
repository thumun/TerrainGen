import * as common from '@/lib/renderers/common';
import { shadowCastVertSrc } from '@/lib/shaders/shaders';
import type { WebGPUContext } from '@/lib/webgpu-context';

export class DirectionalLight {
  // @ts-expect-error TODO: eventually we will read this!
  private readonly shadowDepthTextureView: GPUTextureView;
  // @ts-expect-error TODO: eventually we will read this!
  private readonly shadowPipeline: GPURenderPipeline;

  // static config
  static readonly NearPlane = 1.0;
  static readonly FarPlane = 200;

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
    const uniformsBuffer = device.createBuffer({
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

  // TODO: implement this based on existing render logic
  // public doShadowMapping({ meshes }: { meshes: Mesh[] }) {
  //   meshes.forEach((mesh) => {
  //
  //   });
  // }
}
