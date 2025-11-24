import type { IRenderer } from '@/components/common/webgpu-canvas';
import { InstancePointsPipeline } from '@/lib/renderers/pipelines/instance-points-pipeline';
import { IndirectInstancer } from '@/lib/renderers/pipelines/instancer';
import { NormalsPipeline } from '@/lib/renderers/pipelines/normals-pipeline';
import { TerrainPipeline } from '@/lib/renderers/pipelines/terrain-pipeline';
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
  indirectInstancer: IndirectInstancer;

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

    // compute pipeline that creates the terrain
    this.terrainComputePipeline = new TerrainPipeline(this.device, this.mesh);

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

    // normals compute pipeline that generates normals for the mesh
    this.normalsComputePipeline = new NormalsPipeline(this.device, this.mesh);

    // instancing compute pipeline to scatter points to instance on
    this.instancePointsComputePipeline = new InstancePointsPipeline(
      this.device,
      this.mesh,
      this.normalsComputePipeline,
    );

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

    this.indirectInstancer.runRenderPass(renderPass, this.sceneUniformsBindGroup);

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
          const data = new Float32Array([uniform.initialValue]);
          this.device.queue.writeBuffer(this.nodeGraphUniformBuffer, offset, data);
        } else if (uniform.type === 'u32') {
          const data = new Uint32Array([uniform.initialValue]);
          this.device.queue.writeBuffer(this.nodeGraphUniformBuffer, offset, data);
        } else if (uniform.type === 'vec3f') {
          const data = new Float32Array(uniform.initialValue);
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
      customComputePass.dispatchWorkgroups(Math.ceil(this.mesh.numVertices / 64));

      customComputePass.end();
    }

    // third compute pass: calculate terrain normals
    this.normalsComputePipeline.runComputePass(computePass);

    computePass.end();

    this.device.queue.submit([encoder.finish()]);
  }

  setDisplacePipelineUniform(key: string, value: number | [number, number, number]) {
    if (!this.displacePipelineConfigured) {
      console.log('Cannot set uniform');
      return;
    }

    const offset = this.nodeGraphUniformLayout.get(key);
    if (offset === undefined) {
      console.warn(`Uniform key "${key}" not found`);
      return;
    }

    const uniformConfig = this.nodeGraphUniformConfig.find((u) => u.key === key);
    if (!uniformConfig) {
      console.warn(`Uniform config for key "${key}" not found`);
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
