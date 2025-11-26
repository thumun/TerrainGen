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

    let colRowSize = u32(sqrt(f32(instanceCount)));

    let row = id.x / colRowSize;
    let col = id.x % colRowSize;

    // world position
    let x = f32(col) * (size * 0.25) - (size * 0.5);
    let z = f32(row) * (size * 0.25) - (size * 0.5);

    // convert to local
    let lx = x + size * 0.5;
    let lz = z + size * 0.5;

    // get grid cell
    let cx = clamp(i32(floor(lx / step)), 0, i32(subdivisions - 1u));
    let cz = clamp(i32(floor(lz / step)), 0, i32(subdivisions - 1u));

    let verts_per_row = subdivisions + 1u;
    let cx1 = min(u32(cx) + 1u, subdivisions);
    let cz1 = min(u32(cz) + 1u, subdivisions);

    // find the idxes of the 4 corners

    let idx_bl = u32(cz) * verts_per_row + u32(cx);   // bottom-left
    let idx_br = u32(cz) * verts_per_row + cx1;       // bottom-right
    let idx_tl = cz1 * verts_per_row + u32(cx);       // top-left
    let idx_tr = cz1 * verts_per_row + cx1;           // top-right

    let h_bl = vertices[vertexOffset(idx_bl) + 1];
    let h_br = vertices[vertexOffset(idx_br) + 1];
    let h_tl = vertices[vertexOffset(idx_tl) + 1];
    let h_tr = vertices[vertexOffset(idx_tr) + 1];

    let fx = fract(lx / step);
    let fz = fract(lz / step);

    let height = mix(mix(h_bl, h_br, fx), mix(h_tl, h_tr, fx), fz);

    let vOffset = vertexOffset(id.x);
    instance_pts[vOffset + 0] = x;               // pos.x
    instance_pts[vOffset + 1] = height;               // pos.y
    instance_pts[vOffset + 2] = z;               // pos.z
    instance_pts[vOffset + 3] = 0.0;             // nor.x
    instance_pts[vOffset + 4] = 1.0;             // nor.y
    instance_pts[vOffset + 5] = 0.0;             // nor.z
    instance_pts[vOffset + 6] = 0.0;             // uv.x
    instance_pts[vOffset + 7] = 0.0;             // uv.y
}
