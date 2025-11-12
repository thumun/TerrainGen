import * as generators from './generators';
import * as shaders from './types/shaders';

// TODO: helper to inject utils like noise functions

export function generateVertexShaderCode(
  shaderConfig: shaders.VertexShaderConfig,
  template: shaders.VertexShaderTemplate,
) {
  const uniforms = shaderConfig.uniforms.map(generators.generateUniform).join('\n');

  const processedInstructions = shaderConfig.instructionSet.map(generators.generateCode);

  // use set to remove duplicates
  const shaderUtilMethods = new Set(processedInstructions.flatMap(({ utils }) => utils));
  const utils = [...shaderUtilMethods].flatMap((util) => (util ? [util()] : [])).join('\n\n');

  const body = processedInstructions
    .map(({ code }) => `  ${code.replaceAll('\n', '  \n')}`) // lol add indentation
    .join('\n');

  const heightKey = shaderConfig.outputs.height;

  return template.content({ uniforms, utils, body, heightKey });
}
