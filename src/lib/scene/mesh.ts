// storage class for mesh uniforms
class MeshUniforms {
  readonly buffer = new ArrayBuffer(8);
  private readonly size = new Float32Array(this.buffer, 0, 1);
  private readonly resolution = new Float32Array(this.buffer, 4, 1);

  set setSize(size: number) {
    this.size[0] = size;
  }

  set setResolution(resolution: number) {
    this.resolution[0] = resolution;
  }
}

// template class
export abstract class Mesh {
  size = 0;
  resolution = 0;
  numVertices = 0;
  numIndices = 0;

  vertexBuffer: GPUBuffer | undefined;
  indexBuffer: GPUBuffer | undefined;
  indirectBuffer: GPUBuffer | undefined;

  uniforms: MeshUniforms = new MeshUniforms();
  uniformsBuffer: GPUBuffer | undefined;

  constructor(size = 1, resolution = 1) {
    const numVertices = (resolution + 1) * (resolution + 1);
    const numIndices = resolution * resolution * 6;

    this.size = size;
    this.resolution = resolution;
    this.numVertices = numVertices;
    this.numIndices = numIndices;
  }

  writeBuffers(device: GPUDevice) {
    this.vertexBuffer = device.createBuffer({
      label: 'triangle vertex buffer',
      size: this.numVertices * 32,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });

    this.indexBuffer = device.createBuffer({
      label: 'triangle index buffer',
      size: this.numIndices * 4,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });

    const indirectData = new Uint32Array([
      this.numIndices, // indexCount
      1, // instanceCount
      0, // firstIndex
      0, // baseVertex
      0, // firstInstance
    ]);

    this.indirectBuffer = device.createBuffer({
      label: 'triangle indirect buffer',
      size: indirectData.byteLength,
      usage: GPUBufferUsage.INDIRECT | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });
    device.queue.writeBuffer(this.indirectBuffer, 0, indirectData.buffer);

    // create some uniform buffer for size & resolution
    this.updateUniforms(device, this.size, this.resolution);
  }

  updateUniforms(device: GPUDevice, size = 1, resolution = 2) {
    this.uniformsBuffer = device.createBuffer({
      label: 'uniforms',
      size: this.uniforms.buffer.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });

    this.uniforms.setSize = size;
    this.uniforms.setResolution = resolution;

    device.queue.writeBuffer(this.uniformsBuffer, 0, this.uniforms.buffer);
  }
}

export class Plane extends Mesh {
  constructor(size = 1, resolution = 1) {
    super(size, resolution);
  }
}
