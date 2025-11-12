// compute shader for generating terrain geo

@group(0) @binding(0)
var<storage, read_write> vertices: array<f32>;

@group(0) @binding(1)
var<storage, read_write> indices: array<u32>;

@group(0) @binding(2)
var<storage, read_write> indirect: array<u32>; // indirect draw params

fn vertexOffset(i: u32) -> u32 { 
    return i * 8u; 
}

@compute @workgroup_size(1)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    // generate quad (sorry this sucks)
    // vertex 0
    vertices[vertexOffset(0) + 0] = -1.0; // pos.x
    vertices[vertexOffset(0) + 1] = 0.0;  // pos.y
    vertices[vertexOffset(0) + 2] = -1.0; // pos.z
    vertices[vertexOffset(0) + 3] = 0.0;  // nor.x
    vertices[vertexOffset(0) + 4] = 1.0;  // nor.y
    vertices[vertexOffset(0) + 5] = 0.0;  // nor.z
    vertices[vertexOffset(0) + 6] = 0.0;  // uv.x
    vertices[vertexOffset(0) + 7] = 0.0;  // uv.y

    // vertex 1
    vertices[vertexOffset(1) + 0] = 1.0;
    vertices[vertexOffset(1) + 1] = 0.0;
    vertices[vertexOffset(1) + 2] = -1.0;
    vertices[vertexOffset(1) + 3] = 0.0;
    vertices[vertexOffset(1) + 4] = 1.0;
    vertices[vertexOffset(1) + 5] = 0.0;
    vertices[vertexOffset(1) + 6] = 1.0;
    vertices[vertexOffset(1) + 7] = 0.0;

    // vertex 2
    vertices[vertexOffset(2) + 0] = 1.0;
    vertices[vertexOffset(2) + 1] = 0.0;
    vertices[vertexOffset(2) + 2] = 1.0;
    vertices[vertexOffset(2) + 3] = 0.0;
    vertices[vertexOffset(2) + 4] = 1.0;
    vertices[vertexOffset(2) + 5] = 0.0;
    vertices[vertexOffset(2) + 6] = 1.0;
    vertices[vertexOffset(2) + 7] = 1.0;

    // vertex 3
    vertices[vertexOffset(3) + 0] = -1.0;
    vertices[vertexOffset(3) + 1] = 0.0;
    vertices[vertexOffset(3) + 2] = 1.0;
    vertices[vertexOffset(3) + 3] = 0.0;
    vertices[vertexOffset(3) + 4] = 1.0;
    vertices[vertexOffset(3) + 5] = 0.0;
    vertices[vertexOffset(3) + 6] = 0.0;
    vertices[vertexOffset(3) + 7] = 1.0;

    // fill indices
    indices[0] = 0u;
    indices[1] = 1u;
    indices[2] = 2u;
    indices[3] = 0u;
    indices[4] = 2u;
    indices[5] = 3u;

    // fill indirect draw params
    indirect[0] = 6u; // indexCount
    indirect[1] = 1u; // instanceCount
    indirect[2] = 0u; // firstIndex
    indirect[3] = 0u; // baseVertex
    indirect[4] = 0u; // firstInstance
}
