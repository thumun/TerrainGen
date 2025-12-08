// default fragment shader

override shadowBias: f32 = 0.002;

struct FragmentInput
{
    @location(0) pos: vec3f,
    @location(1) nor: vec3f,
    @location(2) uv: vec2f,
    @location(3) shadow_pos: vec3f,
    @location(4) camera_view_pos: vec3f,
}

@group(0) @binding(0) var<uniform> camera : CameraUniforms;
@group(0) @binding(1) var<uniform> directionalLightUniforms: DirectionalLightUniforms;
@group(0) @binding(2) var shadow_map: texture_depth_2d;
@group(0) @binding(3) var shadow_sampler: sampler;

@fragment
fn main(in: FragmentInput) -> @location(0) vec4f
{
  let shadowSample = textureSample(shadow_map, shadow_sampler, in.shadow_pos.xy);
  let isShadowed = shadowSample < in.shadow_pos.z - shadowBias;

  // do lambertian shading
  let lightDir = normalize(directionalLightUniforms.lightDir);
  var directionalLightStrength = max(dot(in.nor, lightDir), 0.0);
  if isShadowed {
      directionalLightStrength = mix(directionalLightStrength, 0.0, 0.95);
  }
  let directLight = vec3f(1.0, 0.95, 0.8) * directionalLightStrength;

  let ambientLight = vec3f(0.1, 0.1, 0.2);

  let fogStrength = 1.0 - exp(-camera.fogIntensity * length(in.camera_view_pos));

  let baseColor = vec3f(0.8, 0.8, 0.8);

  var color = mix(baseColor * (directLight + ambientLight), camera.fogColor, fogStrength);
  return vec4f(color, 1.0);
}
