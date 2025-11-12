import * as shaders from '../shaders/shaders';

import type { IRenderer } from '@/components/webgpu-canvas';
import type { SceneGraph } from '@/lib/scene';
import { Camera } from '@/lib/scene/camera';
import { Mesh } from '@/lib/scene/mesh';
import { Stage } from '@/lib/scene/stage';
import type { WebGPUContext } from '@/lib/webgpu-context';

export class TerrainRenderer implements IRenderer {
  protected stage: Stage;
  protected camera: Camera;
  protected mesh: Mesh;

  context: GPUCanvasContext;
  device: GPUDevice;

  // ------------------------------------------------------------------------------------------
  // ------ Setup: buffers, layouts, pipeline
  // ------------------------------------------------------------------------------------------

  // these uniform guys
  sceneUniformsBindGroupLayout: GPUBindGroupLayout;
  sceneUniformsBindGroup: GPUBindGroup;

  depthTexture: GPUTexture;
  depthTextureView: GPUTextureView;

  pipeline: GPURenderPipeline;

  // compute pipeline yay
  terrainComputeBindGroupLayout: GPUBindGroupLayout;
  terrainComputeBindGroup: GPUBindGroup;

  terrainComputeUniformBindGroupLayout: GPUBindGroupLayout;
  terrainComputeUniformBindGroup: GPUBindGroup;

  terrainComputePipeline: GPUComputePipeline;

  // custom compute pipeline (hopefully this works lol)
  customComputeBindGroupLayout: GPUBindGroupLayout;
  customComputeBindGroup: GPUBindGroup;

  customComputeUniformBindGroupLayout: GPUBindGroupLayout;
  customComputeUniformBindGroup: GPUBindGroup;

  customComputePipeline: GPUComputePipeline;

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

  constructor(
    private webGPU: WebGPUContext,
    stage: Stage,
  ) {
    this.device = webGPU.device;
    this.context = webGPU.context;
    this.stage = stage;
    this.camera = stage.camera;
    this.mesh = stage.mesh;

    // create vertex data
    this.mesh.writeBuffers(this.device);

    // set up bind groups, layouts, pipelines etc

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

    // initialize depth texture and depth texture view
    this.depthTexture = this.createDepthTexture({
      width: this.webGPU.canvas.width * window.devicePixelRatio,
      height: this.webGPU.canvas.height * window.devicePixelRatio,
    });
    this.depthTextureView = this.depthTexture.createView();

    this.pipeline = this.createRenderPipeline();

    // ---------- compute pipeline stuff -----------
    this.terrainComputeBindGroupLayout = this.device.createBindGroupLayout({
      label: 'terrain compute bind group layout',
      entries: [
        {
          // vertices
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: 'storage',
          },
        },
        {
          // indices
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: 'storage',
          },
        },
      ],
    });

    this.terrainComputeBindGroup = this.device.createBindGroup({
      label: 'terrain compute bind group',
      layout: this.terrainComputeBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.mesh.vertexBuffer! } },
        { binding: 1, resource: { buffer: this.mesh.indexBuffer! } },
      ],
    });

    this.terrainComputeUniformBindGroupLayout = this.device.createBindGroupLayout({
      label: 'terrain compute uniform bind group layout',
      entries: [
        {
          // uniform containing mesh size and resolution
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: 'uniform',
          },
        },
      ],
    });

    this.terrainComputeUniformBindGroup = this.device.createBindGroup({
      label: 'terrain compute uniform bind group',
      layout: this.terrainComputeUniformBindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: this.mesh.uniformsBuffer! } }],
    });

    this.terrainComputePipeline = this.device.createComputePipeline({
      label: 'terrain compute pipeline',
      layout: this.device.createPipelineLayout({
        label: 'terrain compute pipeline layout',
        bindGroupLayouts: [
          this.terrainComputeBindGroupLayout,
          this.terrainComputeUniformBindGroupLayout,
        ],
      }),
      compute: {
        module: this.device.createShaderModule({
          label: 'terrain compute shader',
          code: shaders.terrainComputeSrc,
        }),
        entryPoint: 'main',
      },
    });

    this.customComputeBindGroupLayout = this.device.createBindGroupLayout({
      label: 'custom compute bind group layout',
      entries: [
        {
          // vertices
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: 'storage',
          },
        },
      ],
    });

    this.customComputeBindGroup = this.device.createBindGroup({
      label: 'custom compute bind group',
      layout: this.customComputeBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.mesh.vertexBuffer! } },
      ],
    });

    this.customComputeUniformBindGroupLayout = this.device.createBindGroupLayout({
      label: 'custom compute uniform bind group layout',
      entries: [
        {
          // uniform containing mesh size and resolution
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: 'uniform',
          },
        },
      ],
    });

    this.customComputeUniformBindGroup = this.device.createBindGroup({
      label: 'custom compute uniform bind group',
      layout: this.customComputeUniformBindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: this.mesh.uniformsBuffer! } }],
    });

    this.customComputePipeline = this.device.createComputePipeline({
      label: 'custom compute pipeline',
      layout: this.device.createPipelineLayout({
        label: 'custom compute pipeline layout',
        bindGroupLayouts: [
          this.customComputeBindGroupLayout,
          this.customComputeUniformBindGroupLayout,
        ],
      }),
      compute: {
        module: this.device.createShaderModule({
          label: 'custom compute shader',
          code: shaders.terrainComputeSrc, // change this to displacement compute
        }),
        entryPoint: 'main',
      },
    });


  }

  private createDepthTexture(dimensions: { width: number; height: number }) {
    return this.device.createTexture({
      size: [dimensions.width, dimensions.height],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
  }

  private createRenderPipeline() {
    return this.device.createRenderPipeline({
      layout: this.device.createPipelineLayout({
        label: 'naive pipeline layout',
        bindGroupLayouts: [this.sceneUniformsBindGroupLayout],
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

  onResize(pixelDimensions: { width: number; height: number }) {
    this.depthTexture.destroy();
    this.depthTexture = this.createDepthTexture(pixelDimensions);
    this.depthTextureView = this.depthTexture.createView();

    this.pipeline = this.createRenderPipeline();
  }

  onFrame(frameInfo: { time: number; deltaTime: number }) {
    this.camera.onFrame(frameInfo.deltaTime);

    // run the pipeline
    const encoder = this.device.createCommandEncoder();
    const canvasTextureView = this.context.getCurrentTexture().createView();

    // run the compute pass
    const computePass = encoder.beginComputePass();
    computePass.setPipeline(this.terrainComputePipeline);
    computePass.setBindGroup(0, this.terrainComputeBindGroup);
    computePass.setBindGroup(1, this.terrainComputeUniformBindGroup);

    // what's the optimal amount of workgroups to dispatch?
    // i guess this should depend on the vertex count
    computePass.dispatchWorkgroups(Math.ceil(this.mesh.numVertices / 64));
    computePass.end();

    // run second compute pass (custom shader that we generate)
    const computeEncoder = this.device.createCommandEncoder();
    const customComputePass = computeEncoder.beginComputePass();
    customComputePass.setPipeline(this.customComputePipeline);
    customComputePass.setBindGroup(0, this.customComputeBindGroup);
    customComputePass.setBindGroup(1, this.customComputeUniformBindGroup);
    customComputePass.dispatchWorkgroups(Math.ceil(this.mesh.numVertices / 64));
    customComputePass.end();

    const renderPass = encoder.beginRenderPass({
      label: 'naive render pass',
      colorAttachments: [
        {
          view: canvasTextureView,
          clearValue: [0.3, 0, 0, 1],
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: this.depthTextureView,
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    });

    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, this.sceneUniformsBindGroup);
    renderPass.setVertexBuffer(0, this.mesh.vertexBuffer);
    renderPass.setIndexBuffer(this.mesh.indexBuffer!, 'uint32');
    renderPass.drawIndexedIndirect(this.mesh.indirectBuffer!, 0);
    renderPass.end();

    this.device.queue.submit([encoder.finish()]);
  }

  dispose() {
    // destroy all allocated buffers
    if (this.depthTexture) this.depthTexture.destroy();
    if (this.mesh.vertexBuffer) this.mesh.vertexBuffer.destroy();
    if (this.mesh.indexBuffer) this.mesh.indexBuffer.destroy();
    if (this.mesh.indirectBuffer) this.mesh.indirectBuffer.destroy();
    if (this.mesh.uniformsBuffer) this.mesh.uniformsBuffer.destroy();
  }

  // ------------------------------------------------------------------------------------------
  // ------ Custom methods for MainRenderer
  // ------------------------------------------------------------------------------------------

  setSceneGraph(scene: SceneGraph) {
    // TODO: update pipeline with new scene content
    console.log(scene);
  }
}
