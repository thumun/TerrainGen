// default fragment shader

struct FragmentInput
{
    @location(0) pos: vec3f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f
}

@fragment
fn main(in: FragmentInput) -> @location(0) vec4f
{
  let color = vec3f(fragUV, 0.5);
  return vec4f(color, 1.0);
}
