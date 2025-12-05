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

  transformBuffer: GPUBuffer | undefined;
  transformBindGroupLayout: GPUBindGroupLayout | undefined;
  transformBindGroup: GPUBindGroup | undefined;

  constructor(
    device: GPUDevice,
    instancePointsComputePipeline: InstancePointsPipeline,
    instanceVertexBuffer: GPUBuffer,
    instanceIndexBuffer: GPUBuffer,
    sceneUniformsBindGroupLayout: GPUBindGroupLayout,
    webGPU: WebGPUContext,
    transformMatrix?: Float32Array,
  ) {
    this.device = device;
    this.instancePointsComputePipeline = instancePointsComputePipeline;

    if (transformMatrix) {
      this.transformBuffer = this.device.createBuffer({
        label: 'transform matrix buffer',
        size: 64, // mat4x4 = 16 floats * 4 bytes
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      this.device.queue.writeBuffer(this.transformBuffer, 0, transformMatrix.buffer);

      this.transformBindGroupLayout = this.device.createBindGroupLayout({
        label: 'transform bind group layout',
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.VERTEX,
            buffer: { type: 'uniform' },
          },
        ],
      });

      this.transformBindGroup = this.device.createBindGroup({
        label: 'transform bind group',
        layout: this.transformBindGroupLayout,
        entries: [{ binding: 0, resource: { buffer: this.transformBuffer } }],
      });
    } else {
      // Create identity matrix as default
      const identityMatrix = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);

      this.transformBuffer = this.device.createBuffer({
        label: 'transform matrix buffer (identity)',
        size: 64,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      this.device.queue.writeBuffer(this.transformBuffer, 0, identityMatrix);

      this.transformBindGroupLayout = this.device.createBindGroupLayout({
        label: 'transform bind group layout',
        entries: [{
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: 'uniform' },
        }],
      });

      this.transformBindGroup = this.device.createBindGroup({
        label: 'transform bind group (identity)',
        layout: this.transformBindGroupLayout,
        entries: [{ binding: 0, resource: { buffer: this.transformBuffer } }],
      });
    }

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

    const bindGroupLayouts = [
      sceneUniformsBindGroupLayout,
      this.instancingPointsBindGroupLayout,
    ];
    if (this.transformBindGroupLayout) {
      bindGroupLayouts.push(this.transformBindGroupLayout);
    }

    // create render pipeline for instancing as well
    this.instancingRenderPipeline = this.device.createRenderPipeline({
      label: 'instancing render pipeline',
      layout: this.device.createPipelineLayout({
        label: 'instancing pipeline layout',
        bindGroupLayouts,
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
    if (this.transformBindGroup) {
      renderPass.setBindGroup(2, this.transformBindGroup);
    }
    renderPass.drawIndirect(this.indirectInstanceBuffer, 0);
  }
}
