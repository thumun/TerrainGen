import type { IRenderer } from '@/components/webgpu-canvas';
import type { SceneGraph } from '@/lib/scene';
import type { WebGPUContext } from '@/lib/webgpu-context';

export class MainRenderer implements IRenderer {
  // ------------------------------------------------------------------------------------------
  // ------ Setup: buffers, layouts, pipeline
  // ------------------------------------------------------------------------------------------

  // TODO: these might get killed since we don't have models per se
  modelBindGroupLayout: GPUBindGroupLayout;
  materialBindGroupLayout: GPUBindGroupLayout;

  sceneUniformsBindGroupLayout: GPUBindGroupLayout;
  sceneUniformsBindGroup: GPUBindGroup;

  depthTexture: GPUTexture;
  depthTextureView: GPUTextureView;

  pipeline: GPURenderPipeline;

  private static VertexBufferLayout: GPUVertexBufferLayout = {
    arrayStride: 32,
    attributes: [
      {
        // pos
        format: 'float32x3',
        offset: 0,
        shaderLocation: 0,
      },
      {
        // nor
        format: 'float32x3',
        offset: 12,
        shaderLocation: 1,
      },
      {
        // uv
        format: 'float32x2',
        offset: 24,
        shaderLocation: 2,
      },
    ],
  };

  constructor(private webGPU: WebGPUContext) {
    const { device } = this.webGPU;

    this.modelBindGroupLayout = device.createBindGroupLayout({
      label: 'model bind group layout',
      entries: [
        {
          // modelMat
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: 'uniform' },
        },
      ],
    });

    this.materialBindGroupLayout = device.createBindGroupLayout({
      label: 'material bind group layout',
      entries: [
        {
          // diffuseTex
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {},
        },
        {
          // diffuseTexSampler
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: {},
        },
      ],
    });

    this.sceneUniformsBindGroupLayout = device.createBindGroupLayout({
      label: 'scene uniforms bind group layout',
      entries: [
        // DONE-1.2: an entry for camera uniforms at binding 0, visible to only the vertex shader, and of type "uniform"
        {
          // camera uniforms
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: 'uniform' },
        },
        {
          // lightSet
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: { type: 'read-only-storage' },
        },
      ],
    });

    this.sceneUniformsBindGroup = device.createBindGroup({
      label: 'scene uniforms bind group',
      layout: this.sceneUniformsBindGroupLayout,
      entries: [
        // TODO: import/create camera code, imo we should make an orbit camera
        {
          binding: 0,
          resource: { buffer: this.camera.uniformsBuffer },
        },
        {
          binding: 1,
          // TODO: I think lighting should be a uniform at least at the start
          resource: { buffer: this.lights.lightSetStorageBuffer },
        },
      ],
    });

    this.depthTexture = device.createTexture({
      size: [this.webGPU.canvas.width, this.webGPU.canvas.height],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.depthTextureView = this.depthTexture.createView();

    this.pipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({
        label: 'naive pipeline layout',
        bindGroupLayouts: [
          this.sceneUniformsBindGroupLayout,
          this.modelBindGroupLayout,
          this.materialBindGroupLayout,
        ],
      }),
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: 'less',
        format: 'depth24plus',
      },
      // TODO: replace this with basic triangle rendering just for testing
      vertex: {
        module: device.createShaderModule({
          label: 'naive vert shader',
          code: ``,
        }),
        buffers: [MainRenderer.VertexBufferLayout],
      },
      fragment: {
        module: device.createShaderModule({
          label: 'naive frag shader',
          code: ``,
        }),
        targets: [
          {
            format: this.webGPU.canvasFormat,
          },
        ],
      },
    });
  }

  // ------------------------------------------------------------------------------------------
  // ------ Required methods for IRenderer interface
  // ------------------------------------------------------------------------------------------

  onFrame() {
    // const { device } = this.webGPU;
    // TODO: run the pipeline!
  }

  dispose() {
    // Destroy all allocated buffers
  }

  // ------------------------------------------------------------------------------------------
  // ------ Custom methods for MainRenderer
  // ------------------------------------------------------------------------------------------

  setSceneGraph(scene: SceneGraph) {
    // TODO: update pipeline with new scene content
    console.log(scene);
  }
}
