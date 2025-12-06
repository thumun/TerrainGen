// default fragment shader

override shadowDepthTextureSize: f32 = 2048.0;
override shadowBias: f32 = 0.001;

struct FragmentInput
{
    @location(0) pos: vec3f,
    @location(1) nor: vec3f,
    @location(2) uv: vec2f,
    @location(3) shadow_pos: vec3f,
}

@group(0) @binding(1) var<uniform> directionalLightUniforms: DirectionalLightUniforms;
@group(0) @binding(2) var shadow_map: texture_depth_2d;
@group(0) @binding(3) var shadow_sampler: sampler;

@fragment
fn main(in: FragmentInput) -> @location(0) vec4f
{
  let shadowSample = textureSample(shadow_map, shadow_sampler, in.shadow_pos.xy);
  let isShadowed = shadowSample < in.shadow_pos.z - shadowBias;

  // do lambertian shading
  let lightDir = normalize(directionalLightUniforms.lightPos);
  var directionalLightStrength = max(dot(in.nor, lightDir), 0.0);
  if isShadowed {
      directionalLightStrength = mix(directionalLightStrength, 0.0, 0.95);
  }
  let directLight = vec3f(1.0, 0.95, 0.8) * directionalLightStrength;

  let ambientLight = vec3f(0.1, 0.1, 0.2);

  let baseColor = vec3f(0.8, 0.8, 0.8);

  var color = baseColor * (directLight + ambientLight);
  return vec4f(color, 1.0);
}
