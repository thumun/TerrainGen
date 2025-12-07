// simple vertex shader, transforms points to directional light camera

struct VertexInput
{
    @location(0) pos: vec3f,
    @location(1) nor: vec3f,
    @location(2) uv: vec2f
}

@group(0) @binding(0) var<uniform> directionalLight : DirectionalLightUniforms;
// struct has members 'lightViewProjMatrix' and 'lightPos'

@vertex
fn main(in: VertexInput) -> @builtin(position) vec4f
{
    let modelPos = vec4(in.pos, 1);

    return directionalLight.lightViewProjMatrix * modelPos;
}
