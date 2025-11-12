// template class
export abstract class Mesh {
  size = 0;
  resolution = 0;
  numVertices = 0;
  numIndices = 0;

  vertexBuffer: GPUBuffer | undefined;
  indexBuffer: GPUBuffer | undefined;
  indirectBuffer: GPUBuffer | undefined;

  constructor(size = 1, resolution = 1) {
    let numVertices = (resolution + 1) * (resolution + 1);
    let numIndices = resolution * resolution * 6;

    this.size = size;
    this.resolution = resolution;
    this.numVertices = numVertices;
    this.numIndices = numIndices;

    // TODO: Create some uniform buffer for size & resolution
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
  }
}

export class Plane extends Mesh {
  constructor(size = 1, resolution = 1) {
    super(size, resolution);
  }
}
