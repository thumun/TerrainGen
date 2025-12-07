import path from 'path-browserify';

import * as common from './common';

import type { IRenderer } from '@/components/common/webgpu-canvas';
import { InstancePointsPipeline } from '@/lib/renderers/pipelines/instance-points-pipeline';
import { IndirectInstancer } from '@/lib/renderers/pipelines/instancer';
import { NormalsPipeline } from '@/lib/renderers/pipelines/normals-pipeline';
import { TerrainPipeline } from '@/lib/renderers/pipelines/terrain-pipeline';
import type * as scene from '@/lib/scene';
import { decodeRGBE } from '@/lib/scene/io-rgbe-main/src/decode';
import { OBJ as LoadedMesh } from '@/lib/scene/mesh';
import { Stage } from '@/lib/scene/stage';
import * as jit from '@/lib/shaders/jit';
import { displaceComputeShaderTemplate } from '@/lib/shaders/jit/templates/displace.compute';
import { instanceComputeShaderTemplate } from '@/lib/shaders/jit/templates/instance.compute';
import * as shaders from '@/lib/shaders/shaders';
import type { WebGPUContext } from '@/lib/webgpu-context';

export type TerrainRendererGlobalParameters = {
  size: number;
  resolution: number;
};

export class TerrainRenderer implements IRenderer {
  private readonly stage: Stage;

  private readonly context: GPUCanvasContext;
  private readonly device: GPUDevice;

  // ------------------------------------------------------------------------------------------
  // ------ Static buffers, layouts, pipelines
  // ------------------------------------------------------------------------------------------

  // these uniform guys
  private readonly sceneUniformsBindGroupLayout: GPUBindGroupLayout;
  private readonly sceneUniformsBindGroup: GPUBindGroup;

  // terrain compute pipeline
  private readonly terrainComputePipeline: TerrainPipeline;

  // custom compute pipeline
  private readonly customBindGroupLayout: GPUBindGroupLayout;
  private readonly customBindGroup: GPUBindGroup;

  private readonly customUniformBindGroupLayout: GPUBindGroupLayout;
  private readonly customUniformBindGroup: GPUBindGroup;

  // normals pipeline
  private readonly normalsComputePipeline: NormalsPipeline;

  // ------------------------------------------------------------------------------------------
  // ------ Dynamic buffers, layouts, pipelines
  // ------------------------------------------------------------------------------------------

  // these have to be recreated per canvas resize
  private depthTexture: GPUTexture;
  private depthTextureView: GPUTextureView;

  // TODO: probably convert this into discriminated union with all of the
  //   relevant bindgroups/layouts/buffers, preventing invalid reads
  private displacePipelineConfigured: boolean = false;
  // @ts-expect-error TODO: we will eventually use this!
  //                        or maybe it should live in instancePointsComputePipeline
  private instancingPipelineConfigured: boolean = false;

  /** pipeline for creating points to instance on */
  private instancePointsComputePipeline: InstancePointsPipeline;

  /** instancing things */
  private indirectInstancer: IndirectInstancer | undefined;

  // custom uniform buffer bindings
  private customNodeGraphUniformsBindGroupLayout: GPUBindGroupLayout;
  private customNodeGraphUniformsBindGroup: GPUBindGroup;

  // custom uniform buffers
  private nodeGraphUniformBuffer!: GPUBuffer;
  private nodeGraphUniformLayout!: Map<string, number> | undefined;
  private nodeGraphUniformConfig!: scene.DisplacePipeline['uniforms'] | undefined;

  /** Custom displace pipeline, gets reconfigured whenever node structure is changed */
  private customDisplacePipeline: GPUComputePipeline;

  /** overall render pipeline, must get recreated upon canvas resize */
  private pipeline: GPURenderPipeline;

  // skybox
  private skyboxTexture: GPUTexture | undefined;

  constructor(
    private webGPU: WebGPUContext,
    stage: Stage,
  ) {
    this.device = webGPU.device;
    this.context = webGPU.context;
    this.stage = stage;

    // create vertex data
    this.stage.groundPlane.createBuffers(this.device);

    // set up bind groups, layouts, pipelines etc

    // scene uniform layouts and groups
    this.sceneUniformsBindGroupLayout = this.device.createBindGroupLayout({
      label: 'scene uniforms bind group layout',
      entries: [
        {
          // camera uniforms
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: 'uniform' },
        },
        {
          // directional light
          binding: 1,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: 'uniform' },
        },
        {
          // shadow texture_depth_2d
          binding: 2,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          texture: { sampleType: 'depth' },
        },
        {
          // shadowmap sampler
          binding: 3,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          sampler: { type: 'non-filtering' },
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
          resource: { buffer: this.stage.camera.uniformsBuffer },
        },
        {
          // directional light
          binding: 1,
          resource: { buffer: this.stage.directionalLight.directionalLightUniformsBuffer },
        },
        {
          // shadow texture_depth_2d
          binding: 2,
          resource: this.stage.directionalLight.shadowDepthTextureView,
        },
        {
          // shadowmap sampler
          binding: 3,
          resource: this.device.createSampler({
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
            magFilter: 'nearest',
            minFilter: 'nearest',
          }),
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
    this.terrainComputePipeline = new TerrainPipeline(this.device, this.stage.groundPlane);

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
      entries: [{ binding: 0, resource: { buffer: this.stage.groundPlane.vertexBuffer! } }],
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
      entries: [{ binding: 0, resource: { buffer: this.stage.groundPlane.uniformsBuffer! } }],
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

    this.customDisplacePipeline = this.device.createComputePipeline({
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
    this.normalsComputePipeline = new NormalsPipeline(this.device, this.stage.groundPlane);

    // instancing compute pipeline to scatter points to instance on
    this.instancePointsComputePipeline = new InstancePointsPipeline(
      this.device,
      this.stage.groundPlane,
      this.normalsComputePipeline,
      2,
    );

    // ----------------------------------------------------------------------------------------
    // --------------------  RUNNING COMPUTES
    // ----------------------------------------------------------------------------------------

    const encoder = this.device.createCommandEncoder();
    this.runComputes(encoder);
    this.device.queue.submit([encoder.finish()]);
  }

  private getUniform(key: string): [number, number, number] {
    if (!this.nodeGraphUniformConfig || !this.nodeGraphUniformLayout) {
      console.warn(`Cannot get uniform value for key "${key}" - uniforms not configured`);
      return [0, 0, 0];
    }

    const actualKey = key.startsWith('nodeGraphUniforms.')
      ? key.replace('nodeGraphUniforms.', '')
      : key;

    const uniformConfig = this.nodeGraphUniformConfig.find((u) => u.key === actualKey);
    if (!uniformConfig) {
      console.warn(`Uniform config for key "${actualKey}" not found`);
      return [0, 0, 0];
    }

    if (uniformConfig.type === 'vec3f' && Array.isArray(uniformConfig.initialValue)) {
      return uniformConfig.initialValue;
    }

    console.warn(`Uniform "${actualKey}" is not a vec3f type`);
    return [0, 0, 0];
  }

  private createTransformMatrix(
    translate: [number, number, number],
    rotate: [number, number, number],
    scale: [number, number, number],
  ): Float32Array {
    const matrix = new Float32Array(16);

    // Compute rotation matrices
    const [rx, rz, ry] = rotate;
    const cx = Math.cos(rx),
      sx = Math.sin(rx);
    const cy = Math.cos(ry),
      sy = Math.sin(ry);
    const cz = Math.cos(rz),
      sz = Math.sin(rz);

    // Combined rotation matrix (Z * Y * X)
    const r00 = cy * cz;
    const r01 = cy * sz;
    const r02 = -sy;
    const r10 = sx * sy * cz - cx * sz;
    const r11 = sx * sy * sz + cx * cz;
    const r12 = sx * cy;
    const r20 = cx * sy * cz + sx * sz;
    const r21 = cx * sy * sz - sx * cz;
    const r22 = cx * cy;

    // Apply scale and build matrix (column-major for WebGPU)
    matrix[0] = r00 * scale[0];
    matrix[1] = r10 * scale[0];
    matrix[2] = r20 * scale[0];
    matrix[3] = 0;

    matrix[4] = r01 * scale[2];
    matrix[5] = r11 * scale[2];
    matrix[6] = r21 * scale[2];
    matrix[7] = 0;

    matrix[8] = r02 * scale[1];
    matrix[9] = r12 * scale[1];
    matrix[10] = r22 * scale[1];
    matrix[11] = 0;

    matrix[12] = translate[0];
    matrix[13] = translate[2];
    matrix[14] = translate[1];
    matrix[15] = 1;

    return matrix;
  }

  private runComputes(encoder: GPUCommandEncoder) {
    const computePass = encoder.beginComputePass();

    // pass 1: create terrain
    this.terrainComputePipeline.runComputePass(computePass);

    // pass 2: run custom compute pipeline from node graph
    if (this.displacePipelineConfigured) {
      computePass.setPipeline(this.customDisplacePipeline);
      computePass.setBindGroup(0, this.customBindGroup);
      computePass.setBindGroup(1, this.customUniformBindGroup);
      computePass.setBindGroup(2, this.customNodeGraphUniformsBindGroup);
      computePass.dispatchWorkgroups(Math.ceil(this.stage.groundPlane.numVertices / 64));
    }

    // pass 3: calculate terrain normals
    this.normalsComputePipeline.runComputePass(computePass);

    // pass 4: create points on terrain to instance on
    this.instancePointsComputePipeline.runComputePass(computePass);

    computePass.end();
  }

  async load_skybox(url: string) {
    // create test mesh
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const view = new DataView(arrayBuffer);
    const hdr = decodeRGBE(view);

    // convert rgb to rgba
    const rgbaData = new Float32Array(hdr.width * hdr.height * 4);

    for (let i = 0, j = 0; i < hdr.data.length; i += 3, j += 4) {
      rgbaData[j + 0] = hdr.data[i + 0];
      rgbaData[j + 1] = hdr.data[i + 1];
      rgbaData[j + 2] = hdr.data[i + 2];
      rgbaData[j + 3] = 1.0; // alpha always 1
    }

    console.log(rgbaData);

    // create rectangular texture
    this.skyboxTexture = this.device.createTexture({
      label: "hdr texture",
      size: [hdr.width, hdr.height],
      format: "rgba32float",
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });

    this.device.queue.writeTexture(
      { texture: this.skyboxTexture },
      rgbaData,
      {
        bytesPerRow: hdr.width * 16,  // 8 bytes per pixel in rgba16float
      },
      [hdr.width, hdr.height]
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
        buffers: [common.VERTEX_BUFFER_LAYOUT],
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
    this.stage.camera.onFrame(frameInfo.deltaTime);

    const encoder = this.device.createCommandEncoder();

    // run shadowmapping
    this.stage.directionalLight.onFrame({
      encoder,
      meshes: [this.stage.groundPlane],
      instancers: [...(this.indirectInstancer ? [this.indirectInstancer] : [])],
    });

    // run our main render pass
    const canvasTextureView = this.context.getCurrentTexture().createView();
    const renderPass = encoder.beginRenderPass({
      label: 'naive render pass',
      colorAttachments: [
        {
          view: canvasTextureView,
          clearValue: [0.0, 0, 0, 0],
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
    renderPass.setVertexBuffer(0, this.stage.groundPlane.vertexBuffer);
    renderPass.setIndexBuffer(this.stage.groundPlane.indexBuffer!, 'uint32');
    renderPass.drawIndexedIndirect(this.stage.groundPlane.indirectBuffer!, 0);

    if (this.indirectInstancer) {
      this.indirectInstancer.runRenderPass(renderPass, this.sceneUniformsBindGroup);
    }

    renderPass.end();

    this.device.queue.submit([encoder.finish()]);
  }

  dispose() {
    // destroy all allocated buffers
    if (this.depthTexture) this.depthTexture.destroy();
    if (this.stage.groundPlane.vertexBuffer) this.stage.groundPlane.vertexBuffer.destroy();
    if (this.stage.groundPlane.indexBuffer) this.stage.groundPlane.indexBuffer.destroy();
    if (this.stage.groundPlane.indirectBuffer) this.stage.groundPlane.indirectBuffer.destroy();
    if (this.stage.groundPlane.uniformsBuffer) this.stage.groundPlane.uniformsBuffer.destroy();
    if (this.skyboxTexture) this.skyboxTexture.destroy();
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

    const customComputeShader = jit.generateDisplaceShaderCode(
      config,
      displaceComputeShaderTemplate,
    );

    console.log('custom compute shader:', customComputeShader);

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

    this.customDisplacePipeline = this.device.createComputePipeline({
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

    // RUN COMPUTE PIPELINE
    const encoder = this.device.createCommandEncoder();
    this.runComputes(encoder);
    this.device.queue.submit([encoder.finish()]);
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

  async configureInstancingPipeline(config: scene.InstancingPipeline) {
    this.instancingPipelineConfigured = true;

    console.log(config);

    // load obj from geo node
    const mesh = new LoadedMesh();

    if (config.outputs.fileContent) {
      if (config.outputs.fileType === 'obj') {
        await mesh.parseObjContent(config.outputs.fileContent);
      } else if (config.outputs.fileType === 'gltf' || config.outputs.fileType === 'glb') {
        const { gltfWithBuffers, gltf } = await mesh.loadGltf(config.outputs.fileContent);
        await mesh.parseGLTFContent(gltfWithBuffers, gltf);
      }
    } else {
      await mesh.loadObj(path.join(import.meta.env.BASE_URL, config.outputs.meshPath));
    }

    if (!mesh.vertices || !mesh.indices) {
      return;
    }

    // Create buffers for mesh
    const instanceVertexBuffer = this.device.createBuffer({
      size: mesh.vertices.byteLength,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });
    this.device.queue.writeBuffer(instanceVertexBuffer, 0, mesh.vertices);

    const instanceIndexBuffer = this.device.createBuffer({
      size: mesh.indices.byteLength,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });
    this.device.queue.writeBuffer(instanceIndexBuffer, 0, mesh.indices);

    // set uniforms
    this.nodeGraphUniformConfig = config.uniforms;
    const { totalSize, offsets } = jit.calculateUniformLayout(config.uniforms);
    this.nodeGraphUniformLayout = offsets;

    if (this.nodeGraphUniformBuffer) {
      this.nodeGraphUniformBuffer.destroy();
    }

    this.nodeGraphUniformBuffer = this.device.createBuffer({
      label: 'instancing uniform buffer',
      size: Math.max(totalSize, 16),
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.initializeNodeGraphUniforms(config.uniforms);

    this.customNodeGraphUniformsBindGroupLayout = this.device.createBindGroupLayout({
      label: 'instancing nodegraph bind group layout',
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'uniform' },
        },
      ],
    });

    this.customNodeGraphUniformsBindGroup = this.device.createBindGroup({
      label: 'instancing nodegraph bind group',
      layout: this.customNodeGraphUniformsBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: { buffer: this.nodeGraphUniformBuffer },
        },
      ],
    });

    // create custom instancing shader
    if (!config.outputs.maskKey) {
      config.outputs.maskKey = 'terrainPos.y';
    }
    const customInstanceShader = jit.generateInstanceShaderCode(
      config,
      instanceComputeShaderTemplate,
    );

    console.log('custom instance shader:', customInstanceShader);

    // Run compute to create a buffer of points
    this.instancePointsComputePipeline = new InstancePointsPipeline(
      this.device,
      this.stage.groundPlane,
      this.normalsComputePipeline,
      config.outputs.instanceCount,
      customInstanceShader,
    );

    const encoder = this.device.createCommandEncoder();
    const computePass = encoder.beginComputePass();
    this.instancePointsComputePipeline.runComputePass(computePass);
    computePass.end();
    this.device.queue.submit([encoder.finish()]);

    let transformMatrix: Float32Array | undefined;
    if (config.outputs.transform) {
      const translate =
        typeof config.outputs.transform.translate === 'string'
          ? this.getUniform(config.outputs.transform.translate)
          : ([0, 0, 0] as [number, number, number]);

      const rotate =
        typeof config.outputs.transform.rotate === 'string'
          ? this.getUniform(config.outputs.transform.rotate)
          : ([0, 0, 0] as [number, number, number]);

      const scale =
        typeof config.outputs.transform.scale === 'string'
          ? this.getUniform(config.outputs.transform.scale)
          : ([1, 1, 1] as [number, number, number]);

      transformMatrix = this.createTransformMatrix(translate, rotate, scale);
    }

    this.indirectInstancer = new IndirectInstancer(
      this.device,
      this.instancePointsComputePipeline,
      instanceVertexBuffer,
      instanceIndexBuffer,
      this.sceneUniformsBindGroupLayout,
      this.webGPU,
      mesh.textures,
      transformMatrix,
    );
  }

  disableInstancingPipeline() {
    this.instancingPipelineConfigured = false;
  }

  setMeshUniforms(size: number, resolution: number) {
    this.stage.groundPlane.updateUniforms(this.device, size, resolution);

    const encoder = this.device.createCommandEncoder();
    this.runComputes(encoder);
    this.device.queue.submit([encoder.finish()]);
  }

  setDisplacePipelineUniform(key: string, value: number | [number, number, number]) {
    if (!this.displacePipelineConfigured) {
      console.log('Cannot set uniform');
      return;
    }

    const offset = this.nodeGraphUniformLayout?.get(key);
    if (offset === undefined) {
      console.warn(`Uniform key "${key}" not found`);
      return;
    }

    const uniformConfig = this.nodeGraphUniformConfig?.find((u) => u.key === key);
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

    const encoder = this.device.createCommandEncoder();
    this.runComputes(encoder);
    this.device.queue.submit([encoder.finish()]);
    console.log('rerunning compute after uniform update');
  }
}
