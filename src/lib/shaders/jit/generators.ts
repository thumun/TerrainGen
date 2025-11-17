import * as shaderUtils from './shader-utils';
import * as instructions from './types/instructions';
import type * as util from './types/util';

// TODO: this will likely have to change to use a struct instead
export function generateUniform(
  uniform: util.UniformConfig,
  opts: { group: number; binding: number },
) {
  return `@group(${opts.group}) @binding(${opts.binding}) var<uniform> ${uniform.key} : ${uniform.type};`;
}

type ShaderUtil = () => string;
type GenerateCodeResult = { code: string; utils?: Array<ShaderUtil> };

const OPERATOR_CHARACTERS = {
  add: '+',
  sub: '-',
  mult: '*',
  div: '/',
} as const;
export function generateMathCode(instruction: instructions.Math): GenerateCodeResult {
  const { readA, readB, write } = instruction.references;
  const operatorChar = OPERATOR_CHARACTERS[instruction.operation];

  return { code: `let ${write} = ${readA} ${operatorChar} ${readB};`, utils: [] };
}

export function generateSeparateXYZCode(
  instruction: instructions.SeparateXYZ,
): GenerateCodeResult {
  const { read, writeX, writeY, writeZ } = instruction.references;

  if (!writeX && !writeY && !writeZ)
    console.warn(
      'A `SeparateXYZ` instruction with no outputs was received. There will be no resulting code.',
    );

  return {
    code: [
      ...(writeX ? [`let ${writeX} = ${read}.x;`] : []),
      ...(writeY ? [`let ${writeY} = ${read}.y;`] : []),
      ...(writeZ ? [`let ${writeZ} = ${read}.z;`] : []),
    ].join('\n'),
  };
}

export function generateCombineXYZCode(
  instruction: instructions.CombineXYZ,
): GenerateCodeResult {
  const { readX, readY, readZ, write } = instruction.references;
  return { code: `let ${write} = vec3f(${readX}, ${readY}, ${readZ});` };
}

export function generateNoiseCode(instruction: instructions.Noise): GenerateCodeResult {
  const { pos, scale, numOctaves, write } = instruction.references;
  return {
    code: `let ${write} = fbm_noise(${pos} * ${scale}, ${numOctaves});`,
    utils: [shaderUtils.fbmNoise],
  };
}

export function generateCode(instruction: instructions.All): GenerateCodeResult {
  switch (instruction.type) {
    case 'math':
      return generateMathCode(instruction);
    case 'separate-xyz':
      return generateSeparateXYZCode(instruction);
    case 'combine-xyz':
      return generateCombineXYZCode(instruction);
    case 'noise':
      return generateNoiseCode(instruction);
    default:
      throw new Error(
        `Unknown instruction type "${instruction.type}" passed into generateCode`,
      );
  }
}
