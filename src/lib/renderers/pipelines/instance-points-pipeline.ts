import { NormalsPipeline } from '@/lib/renderers/pipelines/normals-pipeline';
import { Mesh } from '@/lib/scene/mesh';
import * as shaders from '@/lib/shaders/shaders';

export class InstancePointsPipeline {
  device: GPUDevice;
  mesh: Mesh;

  instancePoints: GPUBuffer;

  instanceCount = 1;
  instanceCountBuffer: GPUBuffer;

  instancingBindGroupLayout: GPUBindGroupLayout;
  instancingBindGroup: GPUBindGroup;
  instancingPipeline: GPUComputePipeline;

  normalsComputePipeline: NormalsPipeline;

  customInstanceCode?: string;

  constructor(
    device: GPUDevice,
    mesh: Mesh,
    normalsComputePipeline: NormalsPipeline,
    instanceCount: number,
    customInstanceCode?: string,
    nodeGraphUniformsBindGroupLayout?: GPUBindGroupLayout,
  ) {
    this.device = device;
    this.mesh = mesh;
    this.normalsComputePipeline = normalsComputePipeline;
    this.instanceCount = instanceCount;
    this.customInstanceCode = customInstanceCode;
    this.instancePoints = this.device.createBuffer({
      label: 'instancing points vertex buffer',
      size: Math.max(this.instanceCount * 96, 96),
      usage:
        GPUBufferUsage.VERTEX |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.STORAGE,
    });

    // buffer for numInstances
    const numInstances = new Uint32Array(1);
    numInstances[0] = this.instanceCount;
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

    const bindGroupLayouts = [
      normalsComputePipeline.normalsDataBindGroupLayout,
      normalsComputePipeline.normalsUniformBindGroupLayout,
      this.instancingBindGroupLayout,
    ];

    if (nodeGraphUniformsBindGroupLayout) {
      bindGroupLayouts.push(nodeGraphUniformsBindGroupLayout);
    }

    this.instancingPipeline = this.device.createComputePipeline({
      label: 'instancing compute pipeline',
      layout: this.device.createPipelineLayout({
        label: 'instancing compute pipeline layout',
        bindGroupLayouts: bindGroupLayouts,
      }),
      compute: {
        module: this.device.createShaderModule({
          label: 'instancing compute shader',
          code: this.customInstanceCode ?? shaders.terrainPointsComputeSrc,
        }),
        entryPoint: 'main',
      },
    });
  }

  runComputePass(
    computePass: GPUComputePassEncoder,
    nodeGraphUniformsBindGroup?: GPUBindGroup,
  ) {
    if (this.instanceCount === 0) {
      return;
    }
    computePass.setPipeline(this.instancingPipeline);
    computePass.setBindGroup(0, this.normalsComputePipeline.normalsDataBindGroup);
    computePass.setBindGroup(1, this.normalsComputePipeline.normalsUniformBindGroup);
    computePass.setBindGroup(2, this.instancingBindGroup);

    if (nodeGraphUniformsBindGroup) {
      computePass.setBindGroup(3, nodeGraphUniformsBindGroup);
    }

    computePass.dispatchWorkgroups(Math.ceil(this.instanceCount / 64));
  }
}
