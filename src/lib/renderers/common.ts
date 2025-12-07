export const VERTEX_BUFFER_LAYOUT: GPUVertexBufferLayout = {
  arrayStride: 32,
  attributes: [
    {
      // pos
      format: 'float32x3',
      offset: 0,
      shaderLocation: 0,
    },
    {
      // nor
      format: 'float32x3',
      offset: 12,
      shaderLocation: 1,
    },
    {
      // uv
      format: 'float32x2',
      offset: 24,
      shaderLocation: 2,
    },
  ],
};
