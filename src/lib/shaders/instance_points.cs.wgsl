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

    // generate a random point inside the grid
    let rx = hash11(f32(id.x) * 12.123);
    let rz = hash11(f32(id.x) * 91.331);

    // world pos
    let x = rx * size - size * 0.5;
    let z = rz * size - size * 0.5;

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

    // find vertex offset of each of these
    let v_bl = vertexOffset(idx_bl);
    let v_br = vertexOffset(idx_br);
    let v_tl = vertexOffset(idx_tl);
    let v_tr = vertexOffset(idx_tr);

    let h_bl = vertices[v_bl + 1];
    let h_br = vertices[v_br + 1];
    let h_tl = vertices[v_tl + 1];
    let h_tr = vertices[v_tr + 1];

    // normals for each point also
    let nor_bl = vec3f(vertices[v_bl + 3], vertices[v_bl + 4], vertices[v_bl + 5]);
    let nor_br = vec3f(vertices[v_br + 3], vertices[v_br + 4], vertices[v_br + 5]);
    let nor_tl = vec3f(vertices[v_tl + 3], vertices[v_tl + 4], vertices[v_tl + 5]);
    let nor_tr = vec3f(vertices[v_tr + 3], vertices[v_tr + 4], vertices[v_tr + 5]);

    // fractions...
    let fx = fract(lx / step);
    let fz = fract(lz / step);

    let height = mix(mix(h_bl, h_br, fx), mix(h_tl, h_tr, fx), fz);
    let normal = normalize(mix(mix(nor_bl, nor_br, fx), mix(nor_tl, nor_tr, fx), fz));

    let vOffset = vertexOffset(id.x);
    instance_pts[vOffset + 0] = x;               // pos.x
    instance_pts[vOffset + 1] = height;               // pos.y
    instance_pts[vOffset + 2] = z;               // pos.z
    instance_pts[vOffset + 3] = normal.x;             // nor.x
    instance_pts[vOffset + 4] = normal.y;             // nor.y
    instance_pts[vOffset + 5] = normal.z;             // nor.z
    instance_pts[vOffset + 6] = 0.0;             // uv.x
    instance_pts[vOffset + 7] = 0.0;             // uv.y
}
