// compute shader for generating terrain geo

@group(0) @binding(0)
var<storage, read_write> vertices: array<f32>;

@group(0) @binding(1)
var<storage, read_write> indices: array<u32>;

@group(1) @binding(0)
var<uniform> meshUniforms : MeshUniforms;

// i asked chat to generate some simple noise for testing
fn hash2(p: vec2<f32>) -> f32 {
    // Simple hash based on sine
    let h = sin(dot(p, vec2<f32>(127.1, 311.7))) * 43758.5453123;
    return fract(h);
}

fn noise2d(x: f32, z: f32) -> f32 {
    // Get integer and fractional parts
    let p = vec2<f32>(x, z);
    let i = floor(p);
    let f = fract(p);

    // Four corners
    let a = hash2(i + vec2<f32>(0.0, 0.0));
    let b = hash2(i + vec2<f32>(1.0, 0.0));
    let c = hash2(i + vec2<f32>(0.0, 1.0));
    let d = hash2(i + vec2<f32>(1.0, 1.0));

    // Smooth interpolation
    let u = f * f * (3.0 - 2.0 * f);

    // Bilinear interpolation
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

fn vertexOffset(i: u32) -> u32 { 
    return i * 8u; 
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let subdivisions = u32(meshUniforms.resolution);
    let size = meshUniforms.size;
    let step = size / f32(subdivisions); // .25

    let vertexCount = (subdivisions + 1u) * (subdivisions + 1u); // 25
    let indexCount = subdivisions * subdivisions * 6u; // 16 * 6

    // generate vertices
    if (id.x < vertexCount) {
        let row = id.x / (subdivisions + 1u);
        let col = id.x % (subdivisions + 1u);

        let x = -size / 2.0 + f32(col) * step;
        let z = -size / 2.0 + f32(row) * step;

        let vOffset = vertexOffset(id.x);
        vertices[vOffset + 0] = x; // pos.x
        vertices[vOffset + 1] = noise2d(x, z);  // pos.y
        vertices[vOffset + 2] = z; // pos.z
        vertices[vOffset + 3] = x;  // nor.x
        vertices[vOffset + 4] = 0.0;  // nor.y
        vertices[vOffset + 5] = z;  // nor.z
        vertices[vOffset + 6] = 0.0;  // uv.x
        vertices[vOffset + 7] = 0.0;  // uv.y
    }
    
    // how to calculate normals here? 

    // generate indices
    if (id.x < subdivisions * subdivisions) {
        let i: u32 = id.x / subdivisions; // row of quad
        let j: u32 = id.x % subdivisions; // col of quad

        let topLeft: u32 = i * (subdivisions + 1u) + j;
        let topRight: u32 = topLeft + 1u;
        let bottomLeft: u32 = (i + 1u) * (subdivisions + 1u) + j;
        let bottomRight: u32 = bottomLeft + 1u;

        let baseIndex: u32 = id.x * 6u;
        indices[baseIndex + 0u] = topLeft;
        indices[baseIndex + 1u] = bottomLeft;
        indices[baseIndex + 2u] = bottomRight;

        indices[baseIndex + 3u] = topLeft;
        indices[baseIndex + 4u] = bottomRight;
        indices[baseIndex + 5u] = topRight;
    }

}
