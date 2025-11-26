import * as generators from './generators';
import * as shaders from './types/shaders';

export function generateDisplaceShaderCode(
  shaderConfig: shaders.DisplaceShaderConfig,
  template: shaders.DisplaceShaderTemplate,
) {
  // struct ver of above
  const uniforms = generators.generateUniformStruct(shaderConfig.uniforms);

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

export function generateInstanceShaderCode(
  shaderConfig: shaders.InstancingShaderConfig,
  template: shaders.InstancingShaderTemplate,
) {
  // struct ver of above
  const uniforms = generators.generateUniformStruct(shaderConfig.uniforms);

  const processedInstructions = shaderConfig.instructionSet.map(generators.generateCode);

  // use set to remove duplicates
  const shaderUtilMethods = new Set(processedInstructions.flatMap(({ utils }) => utils));
  const utils = [...shaderUtilMethods].flatMap((util) => (util ? [util()] : [])).join('\n\n');

  const body = processedInstructions
    .map(({ code }) => `  ${code.replaceAll('\n', '  \n')}`) // lol add indentation
    .join('\n');

  const posKey = shaderConfig.outputs.instancePositions;

  return template.content({ uniforms, utils, body, posKey, meshKey: 'mesh' });
}

// double check this
export { calculateUniformLayout } from './generators';
