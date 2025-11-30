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

  constructor(
    device: GPUDevice,
    instancePointsComputePipeline: InstancePointsPipeline,
    instanceVertexBuffer: GPUBuffer,
    instanceIndexBuffer: GPUBuffer,
    sceneUniformsBindGroupLayout: GPUBindGroupLayout,
    webGPU: WebGPUContext,
  ) {
    this.device = device;
    this.instancePointsComputePipeline = instancePointsComputePipeline;

    const drawArgs = new Uint32Array(5); // Change from 4 to 5
    drawArgs[0] = instanceIndexBuffer.size / 4; // Index count (indices are u32, 4 bytes each)
    drawArgs[1] = this.instancePointsComputePipeline.instanceCount; // instance count
    drawArgs[2] = 0; // firstIndex
    drawArgs[3] = 0; // baseVertex
    drawArgs[4] = 0; // firstInstance

    this.indirectInstanceBuffer = this.device.createBuffer({
      label: 'indirect render buffer',
      size: 20,
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

    // create render pipeline for instancing as well
    this.instancingRenderPipeline = this.device.createRenderPipeline({
      label: 'instancing render pipeline',
      layout: this.device.createPipelineLayout({
        label: 'instancing pipeline layout',
        bindGroupLayouts: [sceneUniformsBindGroupLayout, this.instancingPointsBindGroupLayout],
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
  }

  runRenderPass(renderPass: GPURenderPassEncoder, sceneUniforms: GPUBindGroup) {
    renderPass.setPipeline(this.instancingRenderPipeline);
    renderPass.setBindGroup(0, sceneUniforms);
    renderPass.setBindGroup(1, this.instancingPointsBindGroup);
    renderPass.drawIndexedIndirect(this.indirectInstanceBuffer, 0);
  }
}
