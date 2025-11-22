// compute shader for generating instancing points

@group(0) @binding(0)
var<storage, read_write> vertices: array<f32>;

@group(0) @binding(1)
var<storage, read_write> indices: array<u32>;

@group(1) @binding(0)
var<uniform> meshUniforms : MeshUniforms;

@group(2) @binding(0)
var<storage, read_write> instance_pts: array<f32>;

@group(2) @binding(1)
var<uniform> instanceCount: u32;

fn vertexOffset(i: u32) -> u32 { 
    return i * 8u; 
}

fn hash11(n: f32) -> f32 {
    let x = fract(sin(n) * 43758.5453123);
    return x;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let subdivisions = u32(meshUniforms.resolution);
    let size = meshUniforms.size;
    let step = size / f32(subdivisions); // .25

    let vertexCount = (subdivisions + 1u) * (subdivisions + 1u); // 25
    let indexCount = subdivisions * subdivisions * 6u; // 16 * 6
    let numInsts = instanceCount; //hardcoded for now...

   // do stuff :/
    if (id.x >= numInsts) {
        return;
    }

    let row = id.x / 5u;
    let col = id.x % 5u;

    let x = f32(col) * (size * 0.5) - size;
    let z = f32(row) * (size * 0.5) - size;

    let vOffset = vertexOffset(id.x);
    instance_pts[vOffset + 0] = x;               // pos.x
    instance_pts[vOffset + 1] = 1.0;               // pos.y
    instance_pts[vOffset + 2] = z;               // pos.z
    instance_pts[vOffset + 3] = 0.0;             // nor.x
    instance_pts[vOffset + 4] = 1.0;             // nor.y
    instance_pts[vOffset + 5] = 0.0;             // nor.z
    instance_pts[vOffset + 6] = 0.0;             // uv.x
    instance_pts[vOffset + 7] = 0.0;             // uv.y
}
