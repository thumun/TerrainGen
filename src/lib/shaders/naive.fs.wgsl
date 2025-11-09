// default fragment shader

struct FragmentInput
{
    @location(0) pos: vec3f,
}

@fragment
fn main(in: FragmentInput) -> @location(0) vec4f
{
    return vec4(1.0, 0.0, 0.0, 1);
}
