import type { IRenderer } from '@/components/webgpu-canvas';
import type { SceneGraph } from '@/lib/scene';
import type { WebGPUContext } from '@/lib/webgpu-context';
import { Stage } from '@/lib/scene/stage';
import { Camera } from '@/lib/scene/camera';
import * as shaders from '../shaders/shaders';

export class TerrainRenderer implements IRenderer {
  protected stage: Stage;
  protected camera: Camera;

  context: GPUCanvasContext;
  device: GPUDevice;

  // ------------------------------------------------------------------------------------------
  // ------ Setup: buffers, layouts, pipeline
  // ------------------------------------------------------------------------------------------

  // TODO: these might get killed since we don't have models per se
  modelBindGroupLayout: GPUBindGroupLayout;
  materialBindGroupLayout: GPUBindGroupLayout;

  // these uniform guys
  sceneUniformsBindGroupLayout: GPUBindGroupLayout;
  sceneUniformsBindGroup: GPUBindGroup;

  depthTexture: GPUTexture;
  depthTextureView: GPUTextureView;

  pipeline: GPURenderPipeline;
  vertexBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
  numIndices = -1;

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

  constructor(private webGPU: WebGPUContext, stage: Stage) {
    this.device = webGPU.device;
    this.context = webGPU.context;
    this.stage = stage;
    this.camera = stage.camera;

    // create vertex data for a triangle (test)
    const vertexData = new Float32Array([
      0.0,  0.5, 0.0,   0, 0, 1,   0.5, 0.0,
    -0.5, -0.5, 0.0,   0, 0, 1,   0.0, 1.0,
      0.5, -0.5, 0.0,   0, 0, 1,   1.0, 1.0,
    ]);

    const indexData = new Uint32Array([0, 1, 2]);

    this.vertexBuffer = this.device.createBuffer({
      label: 'triangle vertex buffer',
      size: vertexData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    this.device.queue.writeBuffer(this.vertexBuffer, 0, vertexData);

    this.indexBuffer = this.device.createBuffer({
      label: 'triangle index buffer',
      size: indexData.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });

    this.device.queue.writeBuffer(this.indexBuffer, 0, indexData);

    this.numIndices = indexData.length;

    // set up bind groups, layouts, pipelines etc.

    this.modelBindGroupLayout = this.device.createBindGroupLayout({
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

    this.materialBindGroupLayout = this.device.createBindGroupLayout({
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

    // scene uniform layouts and groups
    this.sceneUniformsBindGroupLayout = this.device.createBindGroupLayout({
      label: 'scene uniforms bind group layout',
      entries: [
        {
          // camera uniforms
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: 'uniform' },
        },
      ],
    });
    
    this.sceneUniformsBindGroup = this.device.createBindGroup({
      label: 'scene uniforms bind group',
      layout: this.sceneUniformsBindGroupLayout,
      entries: [
        {
          // camera uniforms
          binding: 0,
          resource: { buffer: this.camera.uniformsBuffer },
        },
      ],
    });

    this.depthTexture = this.device.createTexture({
      size: [this.webGPU.canvas.width, this.webGPU.canvas.height],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.depthTextureView = this.depthTexture.createView();

    this.pipeline = this.device.createRenderPipeline({
      layout: this.device.createPipelineLayout({
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
      vertex: {
        module: this.device.createShaderModule({
          label: 'naive vert shader',
          code: shaders.naiveVertSrc,
        }),
        buffers: [TerrainRenderer.VertexBufferLayout],
      },
      fragment: {
        module: this.device.createShaderModule({
          label: 'naive frag shader',
          code: shaders.naiveFragSrc,
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

  onFrame(frameInfo: { time: number; deltaTime: number }) {
    this.camera.onFrame(frameInfo.deltaTime);

    // run the pipeline
    const encoder = this.device.createCommandEncoder();
    const canvasTextureView = this.context.getCurrentTexture().createView();

    const renderPass = encoder.beginRenderPass({
      label: "naive render pass",
      colorAttachments: [
        {
          view: canvasTextureView,
          clearValue: [1, 0, 0, 1],
          loadOp: "clear",
          storeOp: "store"
        }
      ],
      depthStencilAttachment: {
        view: this.depthTextureView,
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store"
      }
    });
    renderPass.setPipeline(this.pipeline);

    renderPass.setBindGroup(0, this.sceneUniformsBindGroup);

    renderPass.setVertexBuffer(0, this.vertexBuffer);
    renderPass.setIndexBuffer(this.indexBuffer, 'uint32');
    renderPass.drawIndexed(this.numIndices);

    renderPass.end();

    this.device.queue.submit([encoder.finish()]);
  }

  dispose() {
    // destroy all allocated buffers
    if (this.depthTexture) this.depthTexture.destroy();
    if (this.vertexBuffer) this.vertexBuffer.destroy();
    if (this.indexBuffer) this.indexBuffer.destroy();

  }

  // ------------------------------------------------------------------------------------------
  // ------ Custom methods for MainRenderer
  // ------------------------------------------------------------------------------------------

  setSceneGraph(scene: SceneGraph) {
    // TODO: update pipeline with new scene content
    console.log(scene);
  }
}
