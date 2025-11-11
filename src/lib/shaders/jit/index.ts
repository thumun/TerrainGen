import * as generators from './generators';
import * as shaders from './types/shaders';

// TODO: helper to inject utils like noise functions

export function generateVertexShaderCode(
  shaderConfig: shaders.VertexShaderConfig,
  opts: { dynamicUniformsGroup: number },
  template: shaders.VertexShaderTemplate,
) {
  const uniforms = shaderConfig.uniforms
    .map((uniform, idx) =>
      generators.generateUniform(uniform, { group: opts.dynamicUniformsGroup, binding: idx }),
    )
    .join('\n');

  const bodyCode = shaderConfig.instructionSet
    .map(generators.generateCode)
    .map((line) => `    ${line}`)
    .join('\n');

  const heightKey = shaderConfig.outputs.height;

  return template({ uniforms, bodyCode, heightKey });
}
