@group(0) @binding(0)
var hdrTex : texture_2d<f32>;
@group(0) @binding(1)
var hdrSampler : sampler;
@group(0) @binding(2)
var<uniform> camera : CameraUniforms;

struct VertexOut {
    @builtin(position) pos: vec4f,
    @location(0) fragDir: vec3f,
};


@vertex
fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> VertexOut {
    var pos = array<vec2<f32>, 3>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(3.0, -1.0),
        vec2<f32>(-1.0, 3.0)
    );
    
    var out: VertexOut;
    out.pos = vec4f(pos[vertexIndex], 0.0, 1.0);

    let uv = pos[vertexIndex];

    var rotMat = camera.viewMat;
    rotMat[3] = vec4f(0.0, 0.0, 0.0, 1.0);
    out.fragDir = normalize((camera.rotMat * vec4f(uv.x, uv.y, 1.0, 0.0)).xyz);

    return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4<f32> {
    let phi = atan2(in.fragDir.z, in.fragDir.x);
    let theta = asin(in.fragDir.y);
    let u = 0.5 + (phi / (2.0 * 3.14159265));
    let v = 0.5 - (theta / 3.14159265);
    return textureSample(hdrTex, hdrSampler, vec2f(u, v));
}