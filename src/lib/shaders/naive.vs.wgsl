// default vertex shader, does nothing

struct VertexInput
{
    @location(0) pos: vec3f,
    @location(1) nor: vec3f,
    @location(2) uv: vec2f
}

struct VertexOutput
{
    @builtin(position) fragPos: vec4f,
    @location(0) pos: vec3f,
    @location(1) nor: vec3f,
    @location(2) uv: vec2f
}

@group(0) @binding(0) var<uniform> camera : CameraUniforms;

@vertex
fn main(in: VertexInput) -> VertexOutput
{
    let modelPos = vec4(in.pos, 1);

    var out: VertexOutput;
    out.fragPos = camera.viewProjMat * modelPos;
    out.pos = modelPos.xyz;
    out.nor = in.nor;
    out.uv = in.uv;

    return out;
}
