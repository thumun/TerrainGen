@group(0) @binding(0)
var hdrTex : texture_2d<f32>;
@group(0) @binding(1)
var hdrSampler : sampler;
@group(0) @binding(2)
var<uniform> camera : CameraUniforms;

struct VertexOut {
    @builtin(position) pos: vec4f,
    @location(0) viewRay: vec3f,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> VertexOut {
    var positions = array<vec2<f32>, 3>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(3.0, -1.0),
        vec2<f32>(-1.0, 3.0)
    );
    
    var out: VertexOut;
    let pos = positions[vertexIndex];
    out.pos = vec4f(pos, 1.0, 1.0); // Set z=1.0 for far plane
    
    // Transform NDC to view space direction
    let invProj = camera.invProjMat;
    let viewPos = invProj * vec4f(pos, 1.0, 1.0);
    out.viewRay = viewPos.xyz / viewPos.w;

    return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4<f32> {
    // Transform view ray to world space
    let dirWorld = normalize((camera.invViewMat * vec4f(in.viewRay, 0.0)).xyz);

    // Convert to spherical coordinates for equirectangular mapping
    let phi = atan2(dirWorld.z, dirWorld.x);
    let theta = asin(dirWorld.y);
    let u = 0.5 + (phi / (2.0 * 3.14159265));
    let v = 0.5 - (theta / 3.14159265);
    
    var color = textureSample(hdrTex, hdrSampler, vec2f(u, v));
    color = pow(color, vec4f(1.0 / 2.2));

    return color;
}