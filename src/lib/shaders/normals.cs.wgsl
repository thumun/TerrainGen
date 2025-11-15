// compute shader for generating terrain geo

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

    // generate vertices
    if (id.x >= vertexCount) {
        return;
    }

    let row = id.x / (subdivisions + 1u);
    let col = id.x % (subdivisions + 1u);

    let vOffset = vertexOffset(id.x);
    let x0 = vertices[vOffset + 0];
    let y0 = vertices[vOffset + 1];
    let z0 = vertices[vOffset + 2];
    let P = vec3f(x0, y0, z0);

    // find neighbors
    var id_left = id.x;
    var id_right = id.x;
    var id_down = id.x;
    var id_up = id.x;

    if (col > 0u) {
        id_left = id.x - 1u;
    }
    if (col < subdivisions) {
        id_right = id.x + 1u;
    }
    if (row > 0u) {
        id_down = id.x - (subdivisions + 1u);
    }
    if (row < subdivisions) {
        id_up = id.x + (subdivisions + 1u);
    }

    let y_left = vertices[vertexOffset(id_left) + 1];
    let y_right = vertices[vertexOffset(id_right) + 1];
    let y_down = vertices[vertexOffset(id_down) + 1];
    let y_up = vertices[vertexOffset(id_up) + 1];

    let up_pos    = vec3f(x0, y_up,    z0 + step) - P;
    let down_pos  = vec3f(x0, y_down,  z0 - step) - P;
    let left_pos  = vec3f(x0 - step, y_left,  z0) - P;
    let right_pos = vec3f(x0 + step, y_right, z0) - P;

    let N1 = cross(left_pos, up_pos);
    let N2 = cross(up_pos, right_pos);
    let N3 = cross(right_pos, down_pos);
    let N4 = cross(down_pos, left_pos);

    let normal = normalize(N1 + N2 + N3 + N4);

    vertices[vOffset + 3] = normal.x;
    vertices[vOffset + 4] = normal.y;
    vertices[vOffset + 5] = normal.z;
}