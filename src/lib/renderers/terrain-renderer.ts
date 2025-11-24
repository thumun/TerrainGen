import type { IRenderer } from '@/components/common/webgpu-canvas';
import { InstancePointsPipeline } from '@/lib/renderers/pipelines/instance-points-pipeline';
import { IndirectInstancer } from '@/lib/renderers/pipelines/instancer';
import { NormalsPipeline } from '@/lib/renderers/pipelines/normals-pipeline';
import { TerrainPipeline } from '@/lib/renderers/pipelines/terrain-pipeline';
import type * as scene from '@/lib/scene';
import { Camera } from '@/lib/scene/camera';
import { OBJ, Plane } from '@/lib/scene/mesh';
import { Stage } from '@/lib/scene/stage';
import * as jit from '@/lib/shaders/jit';
import { displaceComputeShaderTemplate } from '@/lib/shaders/jit/templates/displace.compute';
import * as shaders from '@/lib/shaders/shaders';
import type { WebGPUContext } from '@/lib/webgpu-context';

export type TerrainRendererGlobalParameters = {
  size: number;
  resolution: number;
};

export class TerrainRenderer implements IRenderer {
  protected stage: Stage;
  protected camera: Camera;
  groundPlane: Plane;

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

  // terrain compute pipeline
  terrainComputePipeline: TerrainPipeline;

  // TODO: probably convert this into discriminated union with all of the
  //   relevant bindgroups/layouts/buffers, preventing invalid reads
  displacePipelineConfigured: boolean = false;
  instancingPipelineConfigured: boolean = false;

  // custom compute pipeline (hopefully this works lol)
  customBindGroupLayout: GPUBindGroupLayout;
  customBindGroup: GPUBindGroup;

  customUniformBindGroupLayout: GPUBindGroupLayout;
  customUniformBindGroup: GPUBindGroup;

  customNodeGraphUniformsBindGroupLayout: GPUBindGroupLayout;
  customNodeGraphUniformsBindGroup: GPUBindGroup;

  customPipeline: GPUComputePipeline;

  // normals pipeline
  normalsComputePipeline: NormalsPipeline;

  // pipeline for creating points to instance on
  instancePointsComputePipeline: InstancePointsPipeline;

  // instancing things
  indirectInstancer: IndirectInstancer | undefined;

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
    this.groundPlane = stage.groundPlane;

    // create vertex data
    this.groundPlane.createBuffers(this.device);

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

    // compute pipeline that creates the terrain
    this.terrainComputePipeline = new TerrainPipeline(this.device, this.groundPlane);

    // ----------------------------------------------------------------------------------------
    // --------------------  CUSTOM COMPUTE PIPELINE
    // ----------------------------------------------------------------------------------------

    this.customBindGroupLayout = this.device.createBindGroupLayout({
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

    this.customBindGroup = this.device.createBindGroup({
      label: 'custom compute bind group',
      layout: this.customBindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: this.groundPlane.vertexBuffer! } }],
    });

    this.customUniformBindGroupLayout = this.device.createBindGroupLayout({
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

    this.customUniformBindGroup = this.device.createBindGroup({
      label: 'custom compute uniform bind group',
      layout: this.customUniformBindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: this.groundPlane.uniformsBuffer! } }],
    });

    this.customNodeGraphUniformsBindGroupLayout = this.device.createBindGroupLayout({
      label: 'custom compute node graph uniform bind group layout',
      entries: [],
    });

    this.customNodeGraphUniformsBindGroup = this.device.createBindGroup({
      label: 'custom compute node graph uniforms bind group',
      layout: this.customNodeGraphUniformsBindGroupLayout,
      entries: [],
    });

    this.customPipeline = this.device.createComputePipeline({
      label: 'custom compute pipeline',
      layout: this.device.createPipelineLayout({
        label: 'custom compute pipeline layout',
        bindGroupLayouts: [this.customBindGroupLayout, this.customUniformBindGroupLayout],
      }),
      compute: {
        module: this.device.createShaderModule({
          label: 'custom compute shader',
          code: shaders.terrainComputeSrc, // change this to displacement compute
        }),
        entryPoint: 'main',
      },
    });

    // normals compute pipeline that generates normals for the mesh
    this.normalsComputePipeline = new NormalsPipeline(this.device, this.groundPlane);

    // instancing compute pipeline to scatter points to instance on
    this.instancePointsComputePipeline = new InstancePointsPipeline(
      this.device,
      this.groundPlane,
      this.normalsComputePipeline,
    );

    // ----------------------------------------------------------------------------------------
    // --------------------  RUNNING COMPUTES
    // ----------------------------------------------------------------------------------------
    const encoder = this.device.createCommandEncoder();
    const computePass = encoder.beginComputePass();

    // first compute pass: create terrain
    this.terrainComputePipeline.runComputePass(computePass);

    // second compute pass: calculate terrain normals
    this.normalsComputePipeline.runComputePass(computePass);

    // temp pass: create points on terrain to instance on
    this.instancePointsComputePipeline.runComputePass(computePass);

    computePass.end();

    this.device.queue.submit([encoder.finish()]);
  }

  async init_mesh() {
    // create test mesh
    const testMesh = new OBJ();
    await testMesh.loadObj('./models/teapot.obj');

    console.log(testMesh.vertices);
    console.log(testMesh.indices);

    const instanceVertexBuffer = this.device.createBuffer({
      label: 'instancing vertex buffer',
      size: testMesh.vertices!.byteLength,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
    });
    this.device.queue.writeBuffer(instanceVertexBuffer, 0, testMesh.vertices!);

    const instanceIndexBuffer = this.device.createBuffer({
      label: 'instancing index buffer',
      size: testMesh.indices!.byteLength,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
    });
    this.device.queue.writeBuffer(instanceIndexBuffer, 0, testMesh.indices!);

    // instancer to draw the mesh we just created
    // eventually replace instanceVertexBuffer and instanceIndexBuffer with a combined Mesh
    this.indirectInstancer = new IndirectInstancer(
      this.device,
      this.instancePointsComputePipeline,
      instanceVertexBuffer,
      instanceIndexBuffer,
      this.sceneUniformsBindGroupLayout,
      this.webGPU,
    );
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
    renderPass.setVertexBuffer(0, this.groundPlane.vertexBuffer);
    renderPass.setIndexBuffer(this.groundPlane.indexBuffer!, 'uint32');
    renderPass.drawIndexedIndirect(this.groundPlane.indirectBuffer!, 0);

    if (this.indirectInstancer) {
      this.indirectInstancer.runRenderPass(renderPass, this.sceneUniformsBindGroup);
    }

    renderPass.end();

    this.device.queue.submit([encoder.finish()]);
  }

  dispose() {
    // destroy all allocated buffers
    if (this.depthTexture) this.depthTexture.destroy();
    if (this.groundPlane.vertexBuffer) this.groundPlane.vertexBuffer.destroy();
    if (this.groundPlane.indexBuffer) this.groundPlane.indexBuffer.destroy();
    if (this.groundPlane.indirectBuffer) this.groundPlane.indirectBuffer.destroy();
    if (this.groundPlane.uniformsBuffer) this.groundPlane.uniformsBuffer.destroy();
  }

  // ------------------------------------------------------------------------------------------
  // ------ Custom methods for MainRenderer
  // ------------------------------------------------------------------------------------------

  configureDisplacePipeline(config: scene.DisplacePipeline) {
    this.displacePipelineConfigured = true;

    // TODO: should uniforms be passed in as a single struct?
    //   We would then have to codegen the uniform struct definition.
    //   Probably not that bad.
    // Otherwise, we will have to make a gajillion buffers
    //
    // consensus after discussion: should use struct.

    // also TODO: reuse code between this and our constructor

    this.customNodeGraphUniformsBindGroupLayout = this.device.createBindGroupLayout({
      label: 'custom nodegraph bind group layout',
      entries: [
        {
          binding: 0, // uniform 1 (vec3f)
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'uniform' },
        },
        {
          binding: 1, // uniform 2 (vec3f)
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'uniform' },
        },
      ],
    });

    const nodeGraphUniformsBuffer0 = this.device.createBuffer({
      size: 4 * 3, // vec3f
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const nodeGraphUniformsBuffer1 = this.device.createBuffer({
      size: 4 * 3,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // TODO: maybe update these uniforms randomly for testing
    // setInterval(() => {}, 1000);

    this.customNodeGraphUniformsBindGroup = this.device.createBindGroup({
      label: 'custom nodegraph bind group',
      layout: this.customNodeGraphUniformsBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: { buffer: nodeGraphUniformsBuffer0 },
        },
        {
          binding: 1,
          resource: { buffer: nodeGraphUniformsBuffer1 },
        },
      ],
    });

    const customComputeShader = jit.generateDisplaceShaderCode(
      config,
      displaceComputeShaderTemplate,
    );

    console.log('custom compute shader:', customComputeShader);

    this.customPipeline = this.device.createComputePipeline({
      label: 'custom compute pipeline',
      layout: this.device.createPipelineLayout({
        label: 'custom compute pipeline layout',
        bindGroupLayouts: [
          this.customBindGroupLayout,
          this.customUniformBindGroupLayout,
          this.customNodeGraphUniformsBindGroupLayout,
        ],
      }),
      compute: {
        module: this.device.createShaderModule({
          label: 'custom compute shader',
          code: customComputeShader,
        }),
        entryPoint: 'main',
      },
    });
  }

  disableDisplacePipeline() {
    this.displacePipelineConfigured = false;
  }

  configureInstancingPipeline() {
    this.instancingPipelineConfigured = true;

    // TODO: Write this method
  }

  disableInstancingPipeline() {
    this.instancingPipelineConfigured = false;
  }

  setMeshUniforms(size: number, resolution: number) {
    this.groundPlane.updateUniforms(this.device, size, resolution);

    const encoder = this.device.createCommandEncoder();
    const computePass = encoder.beginComputePass();

    // rerun computes
    // first compute pass: create terrain
    this.terrainComputePipeline.runComputePass(computePass);

    // run second compute pass (custom shader that we generate) only if setup
    if (this.displacePipelineConfigured) {
      const computeEncoder = this.device.createCommandEncoder();

      const customComputePass = computeEncoder.beginComputePass();
      customComputePass.setPipeline(this.customPipeline);
      customComputePass.setBindGroup(0, this.customBindGroup);
      customComputePass.setBindGroup(1, this.customUniformBindGroup);
      customComputePass.setBindGroup(2, this.customNodeGraphUniformsBindGroup);
      customComputePass.dispatchWorkgroups(Math.ceil(this.groundPlane.numVertices / 64));

      customComputePass.end();
    }

    // third compute pass: calculate terrain normals
    this.normalsComputePipeline.runComputePass(computePass);

    computePass.end();

    this.device.queue.submit([encoder.finish()]);
  }
}
