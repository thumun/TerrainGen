// compute shader for generating water plane geometry

@group(0) @binding(0)
var<storage, read_write> vertices: array<f32>;

@group(0) @binding(1)
var<storage, read_write> indices: array<u32>;

@group(1) @binding(0)
var<uniform> meshUniforms : MeshUniforms;

fn vertexOffset(i: u32) -> u32 {
    return i * 8u;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let subdivisions = u32(meshUniforms.resolution);
    let size = meshUniforms.size;
    let step = size / f32(subdivisions);

    let vertexCount = (subdivisions + 1u) * (subdivisions + 1u);
    let indexCount = subdivisions * subdivisions * 6u;

    // generate vertices for water plane
    if (id.x < vertexCount) {
        let row = id.x / (subdivisions + 1u);
        let col = id.x % (subdivisions + 1u);

        let x = -size / 2.0 + f32(col) * step;
        let z = -size / 2.0 + f32(row) * step;

        let vOffset = vertexOffset(id.x);
        vertices[vOffset + 0] = x;               // pos.x
        vertices[vOffset + 1] = 0.0;             // pos.y
        vertices[vOffset + 2] = z;               // pos.z
        vertices[vOffset + 3] = 0.0;             // nor.x
        vertices[vOffset + 4] = 1.0;             // nor.y
        vertices[vOffset + 5] = 0.0;             // nor.z
        vertices[vOffset + 6] = 0.0;             // uv.x
        vertices[vOffset + 7] = 0.0;             // uv.y
    }

    // generate indices for water plane
    if (id.x < subdivisions * subdivisions) {
        let i: u32 = id.x / subdivisions;
        let j: u32 = id.x % subdivisions;

        let topLeft: u32 = i * (subdivisions + 1u) + j;
        let topRight: u32 = topLeft + 1u;
        let bottomLeft: u32 = (i + 1u) * (subdivisions + 1u) + j;
        let bottomRight: u32 = bottomLeft + 1u;

        let baseIndex: u32 = id.x * 6u;
        indices[baseIndex + 0u] = topLeft;
        indices[baseIndex + 1u] = bottomLeft;
        indices[baseIndex + 2u] = topRight;

        indices[baseIndex + 3u] = bottomLeft;
        indices[baseIndex + 4u] = bottomRight;
        indices[baseIndex + 5u] = topRight;
    }
}