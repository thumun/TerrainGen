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
  let x = (in.nor.x + 5.0) / 10.0;
  let z = (in.nor.z + 5.0) / 10.0;

  return vec4f(x, z, in.nor.y, 1.0);
}
