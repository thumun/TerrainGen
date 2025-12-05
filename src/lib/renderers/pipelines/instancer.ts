import { InstancePointsPipeline } from '@/lib/renderers/pipelines/instance-points-pipeline';
import * as shaders from '@/lib/shaders/shaders';
import type { WebGPUContext } from '@/lib/webgpu-context';

export class IndirectInstancer {
  device: GPUDevice;

  indirectInstanceBuffer: GPUBuffer;
  instancingRenderPipeline: GPURenderPipeline;

  instancingPointsBindGroupLayout: GPUBindGroupLayout;
  instancingPointsBindGroup: GPUBindGroup;

  instancePointsComputePipeline: InstancePointsPipeline;

  textureBindGroup: GPUBindGroup | undefined;
  useTextures = false;

  constructor(
    device: GPUDevice,
    instancePointsComputePipeline: InstancePointsPipeline,
    instanceVertexBuffer: GPUBuffer,
    instanceIndexBuffer: GPUBuffer,
    sceneUniformsBindGroupLayout: GPUBindGroupLayout,
    webGPU: WebGPUContext,
    imageBitmaps?: ImageBitmap[]
  ) {
    this.device = device;
    this.instancePointsComputePipeline = instancePointsComputePipeline;

    const drawArgs = new Uint32Array(4);
    drawArgs[0] = instanceIndexBuffer.size / 4;
    drawArgs[1] = this.instancePointsComputePipeline.instanceCount; // instance count
    drawArgs[2] = 0; // firstIndex
    drawArgs[3] = 0; // baseVertex

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
        { binding: 0, resource: { buffer: this.instancePointsComputePipeline.instancePoints } },
        { binding: 1, resource: { buffer: instanceVertexBuffer } },
        { binding: 2, resource: { buffer: instanceIndexBuffer } },
      ],
    });

    const textureBindGroupLayout = this.device.createBindGroupLayout({
      label: 'texture bind group layout',
      entries: [
        {
          // sampler type...
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: { type: 'filtering' },
        },
        {
          // texture view
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {
            sampleType: 'float',
            viewDimension: '2d',
          },
        }
      ],
    });

    // create render pipeline for instancing as well
    this.instancingRenderPipeline = this.device.createRenderPipeline({
      label: 'instancing render pipeline',
      layout: this.device.createPipelineLayout({
        label: 'instancing pipeline layout',
        bindGroupLayouts: [sceneUniformsBindGroupLayout, this.instancingPointsBindGroupLayout, textureBindGroupLayout],
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
            format: webGPU.canvasFormat,
          },
        ],
      },
    });

    // create buffers for the image bitmaps
    if (imageBitmaps) {
      this.useTextures = true;
      const source = imageBitmaps[0];
      const texture = this.device.createTexture({
        label: "FAT FUCKING TEXTURE!!!!",
        format: 'rgba8unorm',
        size: [source.width, source.height],
        usage: GPUTextureUsage.TEXTURE_BINDING |
          GPUTextureUsage.COPY_DST |
          GPUTextureUsage.RENDER_ATTACHMENT,
      });

      this.device.queue.copyExternalImageToTexture(
        { source, flipY: true },
        { texture },
        { width: source.width, height: source.height },
      );

      const sampler = this.device.createSampler({
        addressModeU: 'repeat',
        addressModeV: 'repeat',
        magFilter: 'linear',
        minFilter: 'linear',
        mipmapFilter: 'linear',
      });

      // create bind groups for textures here

      this.textureBindGroup = this.device.createBindGroup({
        label: 'texture bind group',
        layout: textureBindGroupLayout,
        entries: [
          { binding: 0, resource: sampler },
          { binding: 1, resource: texture.createView() },
        ],
      });
    }
  }

  runRenderPass(renderPass: GPURenderPassEncoder, sceneUniforms: GPUBindGroup) {
    renderPass.setPipeline(this.instancingRenderPipeline);
    renderPass.setBindGroup(0, sceneUniforms);
    renderPass.setBindGroup(1, this.instancingPointsBindGroup);
    if (this.textureBindGroup) {
      renderPass.setBindGroup(2, this.textureBindGroup);
    }
    renderPass.drawIndirect(this.indirectInstanceBuffer, 0);
  }
}
