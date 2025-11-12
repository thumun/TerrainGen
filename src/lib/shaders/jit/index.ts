import * as generators from './generators';
import * as shaders from './types/shaders';

// TODO: helper to inject utils like noise functions

export function generateVertexShaderCode(
  shaderConfig: shaders.VertexShaderConfig,
  template: shaders.VertexShaderTemplate,
) {
  const uniforms = shaderConfig.uniforms.map(generators.generateUniform).join('\n');

  const bodyCode = shaderConfig.instructionSet
    .map(generators.generateCode)
    .map((line) => `  ${line}`) // lol add indentation
    .join('\n');

  const heightKey = shaderConfig.outputs.height;

  return template({ uniforms, bodyCode, heightKey });
}
