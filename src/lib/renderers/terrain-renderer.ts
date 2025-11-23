import type { IRenderer } from '@/components/common/webgpu-canvas';
import type * as scene from '@/lib/scene';
import { Camera } from '@/lib/scene/camera';
import { Mesh } from '@/lib/scene/mesh';
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
  mesh: Mesh;

  context: GPUCanvasContext;
  device: GPUDevice;

  numInstances = 30;

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
  terrainBindGroupLayout: GPUBindGroupLayout;
  terrainBindGroup: GPUBindGroup;

  terrainUniformBindGroupLayout: GPUBindGroupLayout;
  terrainUniformBindGroup: GPUBindGroup;

  terrainPipeline: GPUComputePipeline;

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
  normalsBindGroupLayout: GPUBindGroupLayout;
  normalsBindGroup: GPUBindGroup;

  normalsUniformBindGroupLayout: GPUBindGroupLayout;
  normalsUniformBindGroup: GPUBindGroup;

  normalsPipeline: GPUComputePipeline;

  // instancing things
  instancePoints: GPUBuffer;
  indirectInstanceBuffer: GPUBuffer;
  instanceCountBuffer: GPUBuffer;

  instancingBindGroupLayout: GPUBindGroupLayout;
  instancingBindGroup: GPUBindGroup;
  instancingPipeline: GPUComputePipeline;
  instancingRenderPipeline: GPURenderPipeline;

  instancingPointsBindGroupLayout: GPUBindGroupLayout;
  instancingPointsBindGroup: GPUBindGroup;

  // uniform buffer vars 
  nodeGraphUniformBuffer?: GPUBuffer;
  nodeGraphUniformLayout?: Map<string, number>;
  nodeGraphUniformConfig?: scene.DisplacePipeline['uniforms'];

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

    // ----------------------------------------------------------------------------------------
    // --------------------  TERRAIN COMPUTE PIPELINE
    // ----------------------------------------------------------------------------------------
    this.terrainBindGroupLayout = this.device.createBindGroupLayout({
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

    this.terrainBindGroup = this.device.createBindGroup({
      label: 'terrain compute bind group',
      layout: this.terrainBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.mesh.vertexBuffer! } },
        { binding: 1, resource: { buffer: this.mesh.indexBuffer! } },
      ],
    });

    this.terrainUniformBindGroupLayout = this.device.createBindGroupLayout({
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

    this.terrainUniformBindGroup = this.device.createBindGroup({
      label: 'terrain compute uniform bind group',
      layout: this.terrainUniformBindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: this.mesh.uniformsBuffer! } }],
    });

    this.terrainPipeline = this.device.createComputePipeline({
      label: 'terrain compute pipeline',
      layout: this.device.createPipelineLayout({
        label: 'terrain compute pipeline layout',
        bindGroupLayouts: [this.terrainBindGroupLayout, this.terrainUniformBindGroupLayout],
      }),
      compute: {
        module: this.device.createShaderModule({
          label: 'terrain compute shader',
          code: shaders.terrainComputeSrc,
        }),
        entryPoint: 'main',
      },
    });

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
      entries: [{ binding: 0, resource: { buffer: this.mesh.vertexBuffer! } }],
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
      entries: [{ binding: 0, resource: { buffer: this.mesh.uniformsBuffer! } }],
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

    // ----------------------------------------------------------------------------------------
    // --------------------  NORMALS COMPUTE PIPELINE
    // ----------------------------------------------------------------------------------------

    this.normalsBindGroupLayout = this.device.createBindGroupLayout({
      label: 'normals compute bind group layout',
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

    this.normalsBindGroup = this.device.createBindGroup({
      label: 'normals compute bind group',
      layout: this.normalsBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.mesh.vertexBuffer! } },
        { binding: 1, resource: { buffer: this.mesh.indexBuffer! } },
      ],
    });

    this.normalsUniformBindGroupLayout = this.device.createBindGroupLayout({
      label: 'normals compute uniform bind group layout',
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

    this.normalsUniformBindGroup = this.device.createBindGroup({
      label: 'normals compute uniform bind group',
      layout: this.normalsUniformBindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: this.mesh.uniformsBuffer! } }],
    });

    this.normalsPipeline = this.device.createComputePipeline({
      label: 'normals compute pipeline',
      layout: this.device.createPipelineLayout({
        label: 'normals compute pipeline layout',
        bindGroupLayouts: [this.normalsBindGroupLayout, this.normalsUniformBindGroupLayout],
      }),
      compute: {
        module: this.device.createShaderModule({
          label: 'normals compute shader',
          code: shaders.normalsComputeSrc,
        }),
        entryPoint: 'main',
      },
    });

    // ----------------------------------------------------------------------------------------
    // --------------------  INSTANCING COMPUTE PIPELINE
    // ----------------------------------------------------------------------------------------
    this.instancePoints = this.device.createBuffer({
      label: 'instancing points vertex buffer',
      size: this.numInstances * 32,
      usage:
        GPUBufferUsage.VERTEX |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.STORAGE,
    });

    // buffer for numInstances
    const numInstances = new Uint32Array(1);
    numInstances[0] = this.numInstances;
    this.instanceCountBuffer = this.device.createBuffer({
      label: 'instance count uniform buffer',
      size: 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
    });
    this.device.queue.writeBuffer(this.instanceCountBuffer, 0, numInstances);

    this.instancingBindGroupLayout = this.device.createBindGroupLayout({
      label: 'instancing bind group layout',
      entries: [
        {
          // buffer of vertices
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: 'storage',
          },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: 'uniform',
          },
        },
      ],
    });

    this.instancingBindGroup = this.device.createBindGroup({
      label: 'instancing bind group',
      layout: this.instancingBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.instancePoints } },
        { binding: 1, resource: { buffer: this.instanceCountBuffer } },
      ],
    });

    this.instancingPipeline = this.device.createComputePipeline({
      label: 'instancing compute pipeline',
      layout: this.device.createPipelineLayout({
        label: 'instancing compute pipeline layout',
        bindGroupLayouts: [
          this.normalsBindGroupLayout,
          this.normalsUniformBindGroupLayout,
          this.instancingBindGroupLayout,
        ],
      }),
      compute: {
        module: this.device.createShaderModule({
          label: 'instancing compute shader',
          code: shaders.terrainPointsComputeSrc,
        }),
        entryPoint: 'main',
      },
    });

    // ----------------------------------------------------------------------------------------
    // --------------------  INSTANCING RENDERER SETUP
    // ----------------------------------------------------------------------------------------

    // create index and vertex buffers for things we want to instance (for now, plane)
    // prettier-ignore
    const vertexArray = new Float32Array([
      -1.0,  1.0, 0.0,
       1.0,  1.0, 0.0,
       1.0, -1.0, 0.0,
      -1.0, -1.0, 0.0,
    ]);

    const instanceVertexBuffer = this.device.createBuffer({
      label: 'instancing vertex buffer',
      size: vertexArray.byteLength,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
    });
    this.device.queue.writeBuffer(instanceVertexBuffer, 0, vertexArray);

    const indexArray = new Uint32Array([0, 1, 2, 0, 2, 3]);

    const instanceIndexBuffer = this.device.createBuffer({
      label: 'instancing index buffer',
      size: indexArray.byteLength,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
    });
    this.device.queue.writeBuffer(instanceIndexBuffer, 0, indexArray);

    // do all the renderer setup here...

    const drawArgs = new Uint32Array(4);
    drawArgs[0] = 6; // vertex count for instance
    drawArgs[1] = this.numInstances; // instance count.
    drawArgs[2] = 0; // First Vertex
    drawArgs[3] = 0; // First Instance

    this.indirectInstanceBuffer = this.device.createBuffer({
      label: 'indirect render buffer',
      size: 16,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.INDIRECT,
    });
    this.device.queue.writeBuffer(this.indirectInstanceBuffer, 0, drawArgs);

    this.instancingPointsBindGroupLayout = this.device.createBindGroupLayout({
      label: 'instancing bind group layout 2',
      entries: [
        {
          // buffer of vertices to instance on
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: {
            type: 'read-only-storage',
          },
        },
        {
          // buffer of vertices for thing we're instancing
          binding: 1,
          visibility: GPUShaderStage.VERTEX,
          buffer: {
            type: 'read-only-storage',
          },
        },
        {
          // buffer of indices
          binding: 2,
          visibility: GPUShaderStage.VERTEX,
          buffer: {
            type: 'read-only-storage',
          },
        },
      ],
    });

    this.instancingPointsBindGroup = this.device.createBindGroup({
      label: 'instancing bind group 2',
      layout: this.instancingPointsBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.instancePoints } },
        { binding: 1, resource: { buffer: instanceVertexBuffer } },
        { binding: 2, resource: { buffer: instanceIndexBuffer } },
      ],
    });

    // create render pipeline for instancing as well
    this.instancingRenderPipeline = this.device.createRenderPipeline({
      label: 'instancing render pipeline',
      layout: this.device.createPipelineLayout({
        label: 'instancing pipeline layout',
        bindGroupLayouts: [
          this.sceneUniformsBindGroupLayout,
          this.instancingPointsBindGroupLayout,
        ],
      }),
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: 'less',
        format: 'depth24plus',
      },
      vertex: {
        module: this.device.createShaderModule({
          label: 'instancing render shader',
          code: shaders.instanceSrc,
        }),
        entryPoint: 'vs_main',
      },
      fragment: {
        module: this.device.createShaderModule({
          label: 'instancing render shader',
          code: shaders.instanceSrc,
        }),
        entryPoint: 'fs_main',
        targets: [
          {
            format: this.webGPU.canvasFormat,
          },
        ],
      },
    });

    // ----------------------------------------------------------------------------------------
    // --------------------  RUNNING COMPUTES
    // ----------------------------------------------------------------------------------------
    // create terrain
    const encoder = this.device.createCommandEncoder();

    // first compute pass: create terrain
    const computePass = encoder.beginComputePass();
    computePass.setPipeline(this.terrainPipeline);
    computePass.setBindGroup(0, this.terrainBindGroup);
    computePass.setBindGroup(1, this.terrainUniformBindGroup);
    computePass.dispatchWorkgroups(Math.ceil(this.mesh.numVertices / 64));

    // second compute pass: calculate terrain normals
    computePass.setPipeline(this.normalsPipeline);
    computePass.setBindGroup(0, this.normalsBindGroup);
    computePass.setBindGroup(1, this.normalsUniformBindGroup);
    computePass.dispatchWorkgroups(Math.ceil(this.mesh.numVertices / 64));

    // temp pass: create points on terrain to instance on
    computePass.setPipeline(this.instancingPipeline);
    computePass.setBindGroup(0, this.normalsBindGroup);
    computePass.setBindGroup(1, this.normalsUniformBindGroup);
    computePass.setBindGroup(2, this.instancingBindGroup);
    computePass.dispatchWorkgroups(Math.ceil(this.numInstances / 64));

    computePass.end();

    this.device.queue.submit([encoder.finish()]);
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
    renderPass.setVertexBuffer(0, this.mesh.vertexBuffer);
    renderPass.setIndexBuffer(this.mesh.indexBuffer!, 'uint32');
    renderPass.drawIndexedIndirect(this.mesh.indirectBuffer!, 0);

    renderPass.setPipeline(this.instancingRenderPipeline);
    renderPass.setBindGroup(0, this.sceneUniformsBindGroup);
    renderPass.setBindGroup(1, this.instancingPointsBindGroup);
    renderPass.drawIndirect(this.indirectInstanceBuffer, 0);
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

  configureDisplacePipeline(config: scene.DisplacePipeline) {
    this.displacePipelineConfigured = true;

    // TODO: should uniforms be passed in as a single struct?
    //   We would then have to codegen the uniform struct definition.
    //   Probably not that bad.
    // Otherwise, we will have to make a gajillion buffers
    //
    // consensus after discussion: should use struct.

    // also TODO: reuse code between this and our constructor

    this.nodeGraphUniformConfig = config.uniforms;

    // uses the calculateUniformLayout func to get size of vars
    const { totalSize, offsets } = jit.calculateUniformLayout(config.uniforms);
    this.nodeGraphUniformLayout = offsets;

    // Create or recreate the uniform buffer if size changed
    // this should be good for the dynamic case I think
    if (this.nodeGraphUniformBuffer) {
      this.nodeGraphUniformBuffer.destroy();
    }

    this.nodeGraphUniformBuffer = this.device.createBuffer({
      label: 'uniform buffer',
      size: Math.max(totalSize, 16), // WebGPU minimum uniform buffer size
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.initializeNodeGraphUniforms(config.uniforms);

    this.customNodeGraphUniformsBindGroupLayout = this.device.createBindGroupLayout({
      label: 'custom nodegraph bind group layout',
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'uniform' },
        },
      ],
    });

    this.customNodeGraphUniformsBindGroup = this.device.createBindGroup({
      label: 'custom nodegraph bind group',
      layout: this.customNodeGraphUniformsBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: { buffer: this.nodeGraphUniformBuffer },
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

  private initializeNodeGraphUniforms(uniforms: scene.DisplacePipeline['uniforms']) {
    if (!this.nodeGraphUniformBuffer || !this.nodeGraphUniformLayout) return;

    for (const uniform of uniforms) {
      if (uniform.initialValue !== null) {
        const offset = this.nodeGraphUniformLayout.get(uniform.key);
        if (offset === undefined) continue;

        if (uniform.type === 'f32') {
          const data = new Float32Array([uniform.initialValue as number]);
          this.device.queue.writeBuffer(this.nodeGraphUniformBuffer, offset, data);
        } else if (uniform.type === 'u32') {
          const data = new Uint32Array([uniform.initialValue as number]);
          this.device.queue.writeBuffer(this.nodeGraphUniformBuffer, offset, data);
        } else if (uniform.type === 'vec3f') {
          const data = new Float32Array(uniform.initialValue as [number, number, number]);
          this.device.queue.writeBuffer(this.nodeGraphUniformBuffer, offset, data);
        }
      }
    }
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
    this.mesh.updateUniforms(this.device, size, resolution);

    const encoder = this.device.createCommandEncoder();

    // re run compute

    // first compute pass: create terrain
    const computePass = encoder.beginComputePass();
    computePass.setPipeline(this.terrainPipeline);
    computePass.setBindGroup(0, this.terrainBindGroup);
    computePass.setBindGroup(1, this.terrainUniformBindGroup);
    computePass.dispatchWorkgroups(Math.ceil(this.mesh.numVertices / 64));

    // run second compute pass (custom shader that we generate) only if setup
    if (this.displacePipelineConfigured) {
      const computeEncoder = this.device.createCommandEncoder();

      const customComputePass = computeEncoder.beginComputePass();
      customComputePass.setPipeline(this.customPipeline);
      customComputePass.setBindGroup(0, this.customBindGroup);
      customComputePass.setBindGroup(1, this.customUniformBindGroup);
      customComputePass.setBindGroup(2, this.customNodeGraphUniformsBindGroup);
      customComputePass.dispatchWorkgroups(Math.ceil(this.mesh.numVertices / 64));

      customComputePass.end();
    }

    // third compute pass: calculate terrain normals
    computePass.setPipeline(this.normalsPipeline);
    computePass.setBindGroup(0, this.normalsBindGroup);
    computePass.setBindGroup(1, this.normalsUniformBindGroup);
    computePass.dispatchWorkgroups(Math.ceil(this.mesh.numVertices / 64));
    computePass.end();

    this.device.queue.submit([encoder.finish()]);
  }

  setDisplacePipelineUniform(key: string, value: number | [number, number, number]) {
    if (!this.nodeGraphUniformBuffer || !this.nodeGraphUniformLayout || !this.nodeGraphUniformConfig) {
      console.log('Cannot set uniform');
      return;
    }

    const offset = this.nodeGraphUniformLayout.get(key);
    if (offset === undefined) {
      console.log(`Uniform key "${key}" not found`);
      return;
    }

    const uniformConfig = this.nodeGraphUniformConfig.find((u) => u.key === key);
    if (!uniformConfig) {
      console.log(`Uniform config for key "${key}" not found`);
      return;
    }

    if (uniformConfig.type === 'f32') {
      const data = new Float32Array([value as number]);
      this.device.queue.writeBuffer(this.nodeGraphUniformBuffer, offset, data);
    } else if (uniformConfig.type === 'u32') {
      const data = new Uint32Array([value as number]);
      this.device.queue.writeBuffer(this.nodeGraphUniformBuffer, offset, data);
    } else if (uniformConfig.type === 'vec3f') {
      const data = new Float32Array(value as [number, number, number]);
      this.device.queue.writeBuffer(this.nodeGraphUniformBuffer, offset, data);
    }
  }
}
