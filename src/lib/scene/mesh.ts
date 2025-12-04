import { GLTFLoader, type GLTFWithBuffers, type GLTFMesh, type GLTFMeshPrimitive, type GLTFMaterial, type GLTFSampler } from '@loaders.gl/gltf';
import { forEach, load, parse } from '@loaders.gl/core';
import type { Vec3 } from 'wgpu-matrix';

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

const numComponents: { [key: string]: number } = {
  "SCALAR": 1,
  "VEC2": 2,
  "VEC3": 3,
  "VEC4": 4,
  "MAT4": 16,
};


// template class
export abstract class Mesh {
  numVertices = 0;
  numIndices = 0;

  vertexBuffer: GPUBuffer | undefined;
  indexBuffer: GPUBuffer | undefined;

  indirectBuffer: GPUBuffer | undefined;

  uniforms: MeshUniforms = new MeshUniforms();
  uniformsBuffer: GPUBuffer | undefined;

  constructor(numVertices = 1, numIndices = 1) {
    this.numVertices = numVertices;
    this.numIndices = numIndices;
  }

  createBuffers(device: GPUDevice, vertexBufferSize = 1, indexBufferSize = 1) {
    this.vertexBuffer = device.createBuffer({
      label: 'triangle vertex buffer',
      size: vertexBufferSize * 32,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });

    this.indexBuffer = device.createBuffer({
      label: 'triangle index buffer',
      size: indexBufferSize * 4,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });
  }
}

export class Plane extends Mesh {
  maxResolution = 100;
  maxVertices = (this.maxResolution + 1) * (this.maxResolution + 1);
  maxIndices = this.maxResolution * this.maxResolution * 6;

  size = 0;
  resolution = 0;

  constructor(size = 1, resolution = 1) {
    const numVertices = (resolution + 1) * (resolution + 1);
    const numIndices = resolution * resolution * 6;

    super(numVertices, numIndices);

    this.size = size;
    this.resolution = resolution;
  }

  createBuffers(device: GPUDevice) {
    super.createBuffers(device, this.maxVertices, this.maxIndices);

    // create indirect buffer
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
    this.uniformsBuffer = device.createBuffer({
      label: 'uniforms',
      size: this.uniforms.buffer.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });

    this.updateUniforms(device, this.size, this.resolution);
  }

  updateUniforms(device: GPUDevice, size = 1, resolution = 2) {
    // update uniform buffer
    this.uniforms.setSize = size;
    this.uniforms.setResolution = resolution;
    device.queue.writeBuffer(this.uniformsBuffer!, 0, this.uniforms.buffer);

    // recalculate numIndices
    this.numIndices = resolution * resolution * 6;

    // reset indirect buffer
    const indirectData = new Uint32Array([this.numIndices, 1, 0, 0, 0]);
    device.queue.writeBuffer(this.indirectBuffer!, 0, indirectData.buffer);
  }
}

export class OBJ extends Mesh {
  obj: Mesh | undefined;

  vertices: Float32Array<ArrayBuffer> | undefined;
  indices: Uint32Array<ArrayBuffer> | undefined;

  constructor() {
    super(1, 1);
  }

  async loadObj(url: string) {
    const response = await fetch(url);
    const text = await response.text();
    this.parseObjContent(text);
  }

  parseObjContent(text: string) {
    const positions: number[][] = [];
    const normals: number[][] = [];
    const uvs: number[][] = [];

    const vertexMap = new Map<string, number>();
    const finalVertices: number[] = [];
    const finalIndices: number[] = [];

    const lines = text.split('\n');

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const type = parts[0];

      if (type === 'v') {
        positions.push([Number(parts[1]), Number(parts[2]), Number(parts[3])]);
      } else if (type === 'vn') {
        normals.push([Number(parts[1]), Number(parts[2]), Number(parts[3])]);
      } else if (type === 'vt') {
        uvs.push([Number(parts[1]), Number(parts[2])]);
      } else if (type === 'f') {
        // adding triangulation
        const faceVertices = [];

        for (let i = 1; i < parts.length; i++) {
          const key = parts[i]; // "v/t/n" or "v//n" etc

          if (!vertexMap.has(key)) {
            const [vStr, tStr, nStr] = key.split('/');

            const v = parseInt(vStr) - 1;
            const t = tStr ? parseInt(tStr) - 1 : -1;
            const n = nStr ? parseInt(nStr) - 1 : -1;

            const pos = positions[v];
            const uv = t >= 0 && t < uvs.length ? uvs[t] : [0, 0];
            const nor = n >= 0 && n < normals.length ? normals[n] : [0, 0, 0];

            finalVertices.push(pos[0], pos[1], pos[2], nor[0], nor[1], nor[2], uv[0], uv[1]);

            vertexMap.set(key, finalVertices.length / 8 - 1);
          }

          faceVertices.push(vertexMap.get(key)!);
        }

        for (let i = 1; i < faceVertices.length - 1; i++) {
          finalIndices.push(faceVertices[0]);
          finalIndices.push(faceVertices[i]);
          finalIndices.push(faceVertices[i + 1]);
        }
      }
    }

    this.vertices = new Float32Array(finalVertices);
    this.indices = new Uint32Array(finalIndices);
  }

  async loadGltf(url: string) {
    console.log("load gltf");
    const gltfWithBuffers = (await load(url, GLTFLoader)) as GLTFWithBuffers;
    const gltf = gltfWithBuffers.json;

    console.log(gltf);

    for (const mesh of gltf.meshes!) {
      console.log("Current mesh name:", mesh.name);

      for (const prim of mesh.primitives) {
        let positions;
        let normals;
        let uvs;

        // load positions
        const posAccessor = gltf.accessors![prim.attributes["POSITION"]];
        const posBufferView = gltf.bufferViews![posAccessor.bufferView!];
        const posBuffer = gltfWithBuffers.buffers[posBufferView.buffer]

        const byteOffset = (posBufferView.byteOffset ?? 0) + (posAccessor.byteOffset ?? 0) + posBuffer.byteOffset;

        const posArrayLength = posAccessor.count * numComponents[posAccessor.type];
        positions = new Float32Array(posBuffer.arrayBuffer, byteOffset, posArrayLength) // should be length 72

        console.log(positions);

        // load indices
        const idxAccessor = gltf.accessors![prim.indices!];
        const idxBufferView = gltf.bufferViews![idxAccessor.bufferView!];
        const idxBuffer = gltfWithBuffers.buffers[idxBufferView.buffer];

        const idxOffset = (idxBufferView.byteOffset ?? 0) + (idxAccessor.byteOffset ?? 0) + idxBuffer.byteOffset;
        const idxArrayLength = (positions.length / 3) * numComponents[idxAccessor.type];
        console.log(idxArrayLength);

        const idxArray = new Int32Array(idxBuffer.arrayBuffer, idxOffset, 16);
        console.log(idxArray);

      }
    }
  }

}
