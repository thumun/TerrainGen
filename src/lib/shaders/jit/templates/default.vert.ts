import * as shaders from '../types/shaders';

export const defaultVertexShaderTemplate: shaders.VertexShaderTemplate = {
  content: ({ uniforms, body: bodyCode, heightKey }) => `struct VertexInput
{
  @location(0) pos: vec3f,
  @location(1) nor: vec3f,
  @location(2) uv: vec2f
}

struct VertexOutput
{
  @builtin(position) fragPos: vec4f,
  @location(0) pos: vec3f,
  @location(1) nor: vec3f,
  @location(2) uv: vec2f
}

${uniforms}

@vertex
fn main(in: VertexInput) -> VertexOutput
{
  let modelPos = vec4(in.pos, 1.0);

${bodyCode}

  modelPos.y = ${heightKey};

  var out: VertexOutput;
  out.fragPos = camera.viewProjMat * modelPos;
  out.pos = modelPos.xyz / modelPos.w;
  out.nor = in.nor;
  out.uv = in.uv;

  return out;
}
`,
  localKeys: { terrainPos: 'in.pos' },
};
