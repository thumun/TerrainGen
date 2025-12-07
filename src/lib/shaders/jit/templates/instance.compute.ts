import commonShaderContent from '@/lib/shaders/common.wgsl?raw';
import * as shaders from '@/lib/shaders/jit/types/shaders';

export const instanceComputeShaderTemplate: shaders.InstancingShaderTemplate = {
    content: ({ uniforms, utils, body, posKey, maskKey, threshold }) => `${commonShaderContent}

@group(0) @binding(0) var<storage, read_write> vertices: array<f32>;
@group(0) @binding(1) var<storage, read_write> indices: array<u32>;

@group(1) @binding(0) var<uniform> meshUniforms : MeshUniforms;

@group(2) @binding(0)
var<storage, read_write> instance_pts: array<InstanceVertex>;
@group(2) @binding(1) 
var<uniform> instanceCount: u32;
// @group(2) @binding(2)
// var<storage, read_write> createdInstances: atomic<u32>;

${uniforms}

fn vertexOffset(i: u32) -> u32 { 
    return i * 8u; 
}

fn hash11(n: f32) -> f32 {
    let x = fract(sin(n) * 43758.5453123);
    return x;
}

${utils}

fn generateCode(v: u32) -> f32 {
    let terrainPos = vec3f(
        vertices[v],
        0.0,
        vertices[v + 2u],
    );

    ${body}

    let maskKey = ${maskKey};
    return maskKey;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if (id.x >= instanceCount) {
        return;
    }

    let offset = vertexOffset(id.x);

    let terrainPos = vec3f(
        vertices[offset],
        vertices[offset + 1u],
        vertices[offset + 2u],
    );

    ${body}

    // let instancePos = ${posKey};
    let maskKey = ${maskKey};
    let threshold = ${threshold};

    let subdivisions = u32(meshUniforms.resolution);
    let size = meshUniforms.size;
    let step = size / f32(subdivisions);

    // generate a random point inside the grid
    let rx = hash11(f32(id.x + 1) * 12.123);
    let rz = hash11(f32(id.x + 1) * 91.331);

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

    // run generated code on each of them also. this kinda sucks 
    let h_bl = generateCode(v_bl);
    let h_br = generateCode(v_br);
    let h_tl = generateCode(v_tl);
    let h_tr = generateCode(v_tr);

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

    // do all the annoying calc in here, then store it in instance_pts...
    let helper = select(vec3f(0.0, 1.0, 0.0), vec3f(1.0, 0.0, 0.0), abs(normal.y) > 0.99);
    let T = normalize(cross(helper, normal));
    let B = cross(normal, T);
    let rot = mat3x3f(T, B, normal);

    instance_pts[id.x].pos = vec3<f32>(x, height, z);
    instance_pts[id.x].nor = vec3<f32>(normal.x, normal.y, normal.z);
    instance_pts[id.x].uv = vec2<f32>(0.0, 0.0);
    instance_pts[id.x].rotMat = rot;
}
`,
};
