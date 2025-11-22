import { Mesh } from '@/lib/scene/mesh';
import * as shaders from '@/lib/shaders/shaders';

export class TerrainPipeline {
  device: GPUDevice;
  mesh: Mesh;

  terrainDataBindGroupLayout: GPUBindGroupLayout;
  terrainDataBindGroup: GPUBindGroup;

  terrainUniformBindGroupLayout: GPUBindGroupLayout;
  terrainUniformBindGroup: GPUBindGroup;

  terrainPipeline: GPUComputePipeline;

  constructor(device: GPUDevice, mesh: Mesh) {
    this.device = device;
    this.mesh = mesh;

    this.terrainDataBindGroupLayout = this.device.createBindGroupLayout({
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

    this.terrainDataBindGroup = this.device.createBindGroup({
      label: 'terrain compute bind group',
      layout: this.terrainDataBindGroupLayout,
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
        bindGroupLayouts: [this.terrainDataBindGroupLayout, this.terrainUniformBindGroupLayout],
      }),
      compute: {
        module: this.device.createShaderModule({
          label: 'terrain compute shader',
          code: shaders.terrainComputeSrc,
        }),
        entryPoint: 'main',
      },
    });
  }

  runComputePass(computePass: GPUComputePassEncoder) {
    computePass.setPipeline(this.terrainPipeline);
    computePass.setBindGroup(0, this.terrainDataBindGroup);
    computePass.setBindGroup(1, this.terrainUniformBindGroup);
    computePass.dispatchWorkgroups(Math.ceil(this.mesh.numVertices / 64));
  }
}
