import { Mesh } from '@/lib/scene/mesh';
import * as shaders from '@/lib/shaders/shaders';

export class NormalsPipeline {
  device: GPUDevice;
  mesh: Mesh;

  normalsDataBindGroupLayout: GPUBindGroupLayout;
  normalsDataBindGroup: GPUBindGroup;

  normalsUniformBindGroupLayout: GPUBindGroupLayout;
  normalsUniformBindGroup: GPUBindGroup;

  normalsPipeline: GPUComputePipeline;

  constructor(device: GPUDevice, mesh: Mesh) {
    this.device = device;
    this.mesh = mesh;

    this.normalsDataBindGroupLayout = this.device.createBindGroupLayout({
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

    this.normalsDataBindGroup = this.device.createBindGroup({
      label: 'normals compute bind group',
      layout: this.normalsDataBindGroupLayout,
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
        bindGroupLayouts: [this.normalsDataBindGroupLayout, this.normalsUniformBindGroupLayout],
      }),
      compute: {
        module: this.device.createShaderModule({
          label: 'normals compute shader',
          code: shaders.normalsComputeSrc,
        }),
        entryPoint: 'main',
      },
    });
  }

  runComputePass(computePass: GPUComputePassEncoder) {
    computePass.setPipeline(this.normalsPipeline);
    computePass.setBindGroup(0, this.normalsDataBindGroup);
    computePass.setBindGroup(1, this.normalsUniformBindGroup);
    computePass.dispatchWorkgroups(Math.ceil(this.mesh.numVertices / 64));
  }
}
