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
    @location(2) uv: vec2f,
    @location(3) shadow_pos: vec3f,
}

@group(0) @binding(0) var<uniform> camera : CameraUniforms;
@group(0) @binding(1) var<uniform> directionalLight: DirectionalLightUniforms;

@vertex
fn main(in: VertexInput) -> VertexOutput
{
    let modelPos = vec4(in.pos, 1);

    // reference:
    // https://webgpu.github.io/webgpu-samples/?sample=shadowMapping
    let posFromLight = directionalLight.lightViewProjMatrix * modelPos;

    var out: VertexOutput;
    out.fragPos = camera.viewProjMat * modelPos;
    out.pos = modelPos.xyz;
    out.nor = in.nor;
    out.uv = in.uv;
    out.shadow_pos = vec3f(
        posFromLight.xy * vec2(0.5, -0.5) + vec2(0.5),
        posFromLight.z
    );

    return out;
}
