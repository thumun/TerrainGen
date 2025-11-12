// template class
export abstract class Mesh {
  vertexData: Float32Array;
  indexData: Uint32Array;

  vertexBuffer: GPUBuffer | undefined;
  indexBuffer: GPUBuffer | undefined;
  indirectBuffer: GPUBuffer | undefined;
  numIndices = -1;

  constructor(vertices: Float32Array, indices: Uint32Array) {
    this.vertexData = vertices;
    this.indexData = indices;
    this.numIndices = indices.length;
  }

  writeBuffers(device: GPUDevice) {
    let numVertices = 25;
    let numIndices = 96;

    this.vertexBuffer = device.createBuffer({
      label: 'triangle vertex buffer',
      size: numVertices * 32,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });

    this.indexBuffer = device.createBuffer({
      label: 'triangle index buffer',
      size: numIndices * 4,
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
    // prettier-ignore
    const vertices = new Float32Array([
      // position       normal    uv
      -size, 0, -size,  0, 1, 0,  0, 0,
       size, 0, -size,  0, 1, 0,  1, 0,
       size, 0,  size,  0, 1, 0,  1, 1,
      -size, 0,  size,  0, 1, 0,  0, 1,
    ]);

    // prettier-ignore
    const indices = new Uint32Array([
      0, 1, 2,
      0, 2, 3,
    ]);

    super(vertices, indices);
  }
}
