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
    var positions = array<vec2<f32>, 3>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(3.0, -1.0),
        vec2<f32>(-1.0, 3.0)
    );
    
    var out: VertexOut;
    out.pos = vec4f(positions[vertexIndex], 0.0, 1.0);
    out.fragDir = vec3f(positions[vertexIndex], 1.0); // forward screen direction

    return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4<f32> {
    let dirView = normalize(in.fragDir);

    let dirWorld = normalize((camera.invViewMat * vec4f(dirView, 0.0)).xyz);

    let phi = atan2(dirWorld.z, dirWorld.x);
    let theta = asin(dirWorld.y);
    let u = 0.5 + (phi / (2.0 * 3.14159265));
    let v = 0.5 - (theta / 3.14159265);
    return textureSample(hdrTex, hdrSampler, vec2f(u, v));
}