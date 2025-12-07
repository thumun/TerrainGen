struct FragmentInput
{
    @location(0) pos: vec3f,
    @location(1) nor: vec3f,
    @location(2) uv: vec2f
}

struct WaterHeightUniforms {
    height: f32,
}

@group(0) @binding(0) var<uniform> camera : CameraUniforms;
@group(1) @binding(0) var<uniform> waterHeight : WaterHeightUniforms;

@fragment
fn main(in: FragmentInput) -> @location(0) vec4f
{
  let grass = vec3f(0.32, 0.41, 0.06);
  let sand = vec3f(0.95, 0.88, 0.71);
  let underwater = vec3f(0.2, 0.3, 0.4);

  var baseColor = grass;
  if (waterHeight.height > in.pos.y) {
    baseColor = underwater;
  } else if (waterHeight.height <= in.pos.y && waterHeight.height > in.pos.y - 0.2f) {
    let t = (in.pos.y - waterHeight.height) / 0.2;
    baseColor = mix(sand, grass, t);
  }
  else {
    baseColor = grass;
  }

  let lightDir = normalize(vec3f(-1.0, 1.0, -1.0));
  let diffuse = max(dot(in.nor, lightDir), 0.0);
  let color = baseColor * diffuse;

  return vec4f(color, 1.0);
}