import { Mesh } from '@/lib/scene/mesh';
import * as shaders from '@/lib/shaders/shaders';

export class WaterPipeline {
  device: GPUDevice;
  mesh: Mesh;

  waterDataBindGroupLayout: GPUBindGroupLayout;
  waterDataBindGroup: GPUBindGroup;

  waterUniformBindGroupLayout: GPUBindGroupLayout;
  waterUniformBindGroup: GPUBindGroup;

  waterPipeline: GPUComputePipeline;

  constructor(device: GPUDevice, mesh: Mesh) {
    this.device = device;
    this.mesh = mesh;

    this.waterDataBindGroupLayout = this.device.createBindGroupLayout({
      label: 'water compute bind group layout',
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

    this.waterDataBindGroup = this.device.createBindGroup({
      label: 'water compute bind group',
      layout: this.waterDataBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.mesh.vertexBuffer! } },
        { binding: 1, resource: { buffer: this.mesh.indexBuffer! } },
      ],
    });

    this.waterUniformBindGroupLayout = this.device.createBindGroupLayout({
      label: 'water compute uniform bind group layout',
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

    this.waterUniformBindGroup = this.device.createBindGroup({
      label: 'water compute uniform bind group',
      layout: this.waterUniformBindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: this.mesh.uniformsBuffer! } }],
    });

    this.waterPipeline = this.device.createComputePipeline({
      label: 'water compute pipeline',
      layout: this.device.createPipelineLayout({
        label: 'water compute pipeline layout',
        bindGroupLayouts: [this.waterDataBindGroupLayout, this.waterUniformBindGroupLayout],
      }),
      compute: {
        module: this.device.createShaderModule({
          label: 'water compute shader',
          code: shaders.waterComputeSrc,
        }),
        entryPoint: 'main',
      },
    });
  }

  runComputePass(computePass: GPUComputePassEncoder) {
    computePass.setPipeline(this.waterPipeline);
    computePass.setBindGroup(0, this.waterDataBindGroup);
    computePass.setBindGroup(1, this.waterUniformBindGroup);
    computePass.dispatchWorkgroups(Math.ceil(this.mesh.numVertices / 64));
  }
}
