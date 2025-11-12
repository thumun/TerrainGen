// a mesh w triangles or something
export class Mesh {
  vertexData: Float32Array;
  indexData: Uint32Array;

  vertexBuffer: GPUBuffer | undefined;
  indexBuffer: GPUBuffer | undefined;
  numIndices = -1;

  constructor() {
    this.vertexData = new Float32Array([
      0.0, 10, -10.0, 0, 0, 1, 0.5, 0.0, -10, -10, -10.0, 1, 0, 0, 0.0, 1.0, 10, -10, -10.0, 0,
      1, 0, 1.0, 1.0,
    ]);

    this.indexData = new Uint32Array([0, 1, 2]);

    this.numIndices = this.indexData.length;
  }

  writeBuffers(device: GPUDevice) {
    this.vertexBuffer = device.createBuffer({
      label: 'triangle vertex buffer',
      size: this.vertexData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(this.vertexBuffer, 0, this.vertexData.buffer);

    this.indexBuffer = device.createBuffer({
      label: 'triangle index buffer',
      size: this.indexData.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(this.indexBuffer, 0, this.indexData.buffer);
  }
}
