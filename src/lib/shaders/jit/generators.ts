import * as instructions from './types/instructions';
import type * as util from './types/util';

export function generateUniform(uniform: util.Uniform) {
  return `@group(${uniform.group}) @binding(${uniform.binding}) var<uniform> ${uniform.key} : ${uniform.type};`;
}

const OPERATOR_CHARACTERS = {
  add: '+',
  sub: '-',
  mult: '*',
  div: '/',
};
export function generateMathCode(instruction: instructions.Math) {
  const { readA, readB, write } = instruction.references;
  const operatorChar = OPERATOR_CHARACTERS[instruction.operation];

  return `let ${write} = ${readA} ${operatorChar} ${readB};`;
}

export function generateSeparateXYZCode(instruction: instructions.SeparateXYZ) {
  const { read, writeX, writeY, writeZ } = instruction.references;

  if (!writeX && !writeY && !writeZ)
    console.warn(
      'A `SeparateXYZ` instruction with no outputs was received. There will be no resulting code.',
    );

  return [
    ...(writeX ? [`let ${writeX} = ${read}.x;`] : []),
    ...(writeY ? [`let ${writeY} = ${read}.y;`] : []),
    ...(writeZ ? [`let ${writeZ} = ${read}.z;`] : []),
  ].join('\n');
}

export function generateCombineXYZCode(instruction: instructions.CombineXYZ) {
  const { readX, readY, readZ, write } = instruction.references;
  return `let ${write} = vec3f(${readX}, ${readY}, ${readZ});`;
}

export function generateCode(instruction: instructions.All) {
  switch (instruction.type) {
    case 'math': {
      return generateMathCode(instruction);
    }
    case 'separate-xyz': {
      return generateSeparateXYZCode(instruction);
    }
    case 'combine-xyz': {
      return generateCombineXYZCode(instruction);
    }
  }
}
