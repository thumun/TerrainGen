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

// Calculate the size and offsets for uniform struct members
export function calculateUniformLayout(uniforms: util.UniformConfig[]): {
  totalSize: number;
  offsets: Map<string, number>;
} {
  const offsets = new Map<string, number>();
  let currentOffset = 0;

  for (const uniform of uniforms) {
    if (uniform.type === 'f32' || uniform.type === 'u32') {
      currentOffset = Math.ceil(currentOffset / 4) * 4;
      offsets.set(uniform.key, currentOffset);
      currentOffset += 4;
    } else if (uniform.type === 'vec3f') {
      // Align to 16 bytes
      currentOffset = Math.ceil(currentOffset / 16) * 16;
      offsets.set(uniform.key, currentOffset);
      currentOffset += 16;
    }
  }

  const totalSize = Math.ceil(currentOffset / 16) * 16;

  return { totalSize, offsets };
}

export function generateUniformStruct(uniforms: util.UniformConfig[]): string {
  if (uniforms.length === 0) {
    return '';
  }

  const structFields = uniforms
    .map((uniform) => `${uniform.key}: ${uniform.type},`)
    .join('\n');

  return `struct NodeGraphUniforms { ${structFields} } @group(2) @binding(0) var<uniform> nodeGraphUniforms : NodeGraphUniforms;`;
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

const TRIG_FUNCTIONS = {
  sin: 'sin',
  cos: 'cos',
  tan: 'tan',
};
export function generateTrigMathCode(instruction: instructions.TrigMath): GenerateCodeResult {
  const { read, write } = instruction.references;
  const functionName = TRIG_FUNCTIONS[instruction.operation];

  return { code: `let ${write} = ${functionName}(${read});` };
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

export function generateVectorCode(instruction: instructions.Vector): GenerateCodeResult {
  const { write } = instruction.references;
  // TODO: figure out what this should spit out
  return { code: `// write param: ${write}` };
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
    case 'trig-math':
      return generateTrigMathCode(instruction);
    case 'separate-xyz':
      return generateSeparateXYZCode(instruction);
    case 'combine-xyz':
      return generateCombineXYZCode(instruction);
    case 'vector':
      return generateVectorCode(instruction);
    case 'noise':
      return generateNoiseCode(instruction);
  }
}
