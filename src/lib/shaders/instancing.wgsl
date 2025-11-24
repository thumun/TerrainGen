@group(0) @binding(0)
var<uniform> camera : CameraUniforms;

@group(1) @binding(0)
var<storage, read> instance_pts: array<f32>; // 8 floats per instance- pos, nor, uv

@group(1) @binding(1)
var<storage, read> vertices: array<f32>; // 8 floats per vertex

@group(1) @binding(2)
var<storage, read> indices: array<u32>;

struct VertexIn {
    @builtin(vertex_index) vertex_index: u32,
    @builtin(instance_index) instance_index: u32
};

struct VertexOut {
    @builtin(position) position : vec4f,
    @location(0) pos : vec3f,
    @location(1) nor : vec3f,
    @location(2) uv : vec2f,
};

@vertex
fn vs_main(in : VertexIn) -> VertexOut {
    var out : VertexOut;

    let vOffset = in.instance_index * 8u;

     // get point position
    var pos = vec3f(1.0, 1.0, 1.0);
    pos.x = instance_pts[vOffset + 0];
    pos.y = instance_pts[vOffset + 1];
    pos.z = instance_pts[vOffset + 2];

    let idx = indices[in.vertex_index];
    let base = idx * 8u;
    let local = vec3f(
        vertices[base + 0],
        vertices[base + 1],
        vertices[base + 2],
    );
    let world = vec4(pos.x + local.x, pos.y + local.y, pos.z + local.z, 1.0);
    let world_pos = camera.viewProjMat * world;

    // set output
    out.position = world_pos;
    out.pos = world_pos.xyz;
    out.nor = vec3f(0.0, 1.0, 0.0);
    out.uv = vec2f(1.0, 1.0);
    return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f
{
  return vec4f(1.0, 0.0, 0.0, 1.0);
}
