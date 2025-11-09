// default vertex shader, does nothing

struct VertexInput
{
    @location(0) pos: vec3f,
}

struct VertexOutput
{
    @builtin(position) fragPos: vec4f,
    @location(0) pos: vec3f,
}

@vertex
fn main(in: VertexInput) -> VertexOutput
{
    var out: VertexOutput;
    out.fragPos = in.pos;
    out.pos = in.pos;

    return out;
}
