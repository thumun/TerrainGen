// default fragment shader

struct FragmentInput
{
    @location(0) pos: vec3f,
    @location(1) nor: vec3f,
    @location(2) uv: vec2f
}

@fragment
fn main(in: FragmentInput) -> @location(0) vec4f
{
  return vec4f(in.nor.x, in.nor.y, in.nor.z, 1.0);
}
