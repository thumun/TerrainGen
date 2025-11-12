import { describe, expect, it } from 'vitest';

import * as generators from '../generators';

describe('generateUniform', () => {
  it('generates uniform input code', () => {
    const result = generators.generateUniform({
      key: 'unif1',
      type: 'f32',
      group: 1,
      binding: 2,
    });
    expect(result).toBe(`@group(1) @binding(2) var<uniform> unif1 : f32;`);
  });
});

describe('math', () => {
  it('creates addition instructions', () => {
    const result = generators.generateMathCode({
      type: 'math',
      operation: 'add',
      references: { readA: 'alpha', readB: 'beta', write: 'gamma' },
    });
    expect(result.code).toBe('let gamma = alpha + beta;');
  });

  it('creates subtraction instructions', () => {
    const result = generators.generateMathCode({
      type: 'math',
      operation: 'sub',
      references: { readA: 'alpha', readB: 'beta', write: 'gamma' },
    });
    expect(result.code).toBe('let gamma = alpha - beta;');
  });

  it('creates multiplication instructions', () => {
    const result = generators.generateMathCode({
      type: 'math',
      operation: 'mult',
      references: { readA: 'alpha', readB: 'beta', write: 'gamma' },
    });
    expect(result.code).toBe('let gamma = alpha * beta;');
  });

  it('creates division instructions', () => {
    const result = generators.generateMathCode({
      type: 'math',
      operation: 'div',
      references: { readA: 'alpha', readB: 'beta', write: 'gamma' },
    });
    expect(result.code).toBe('let gamma = alpha / beta;');
  });
});

describe('separate XYZ', () => {
  it('separates just X component', () => {
    const result = generators.generateSeparateXYZCode({
      type: 'separate-xyz',
      references: { read: 'alpha', writeX: 'beta' },
    });
    expect(result.code).toBe(`let beta = alpha.x;`);
  });

  it('separates into all XYZ variables', () => {
    const result = generators.generateSeparateXYZCode({
      type: 'separate-xyz',
      references: { read: 'alpha', writeX: 'beta', writeY: 'gamma', writeZ: 'delta' },
    });
    expect(result.code).toBe(`let beta = alpha.x;
let gamma = alpha.y;
let delta = alpha.z;`);
  });
});

describe('combine XYZ', () => {
  it('combines all given inputs', () => {
    const result = generators.generateCombineXYZCode({
      type: 'combine-xyz',
      references: { readX: 'alpha', readY: 'beta', readZ: 'gamma', write: 'delta' },
    });
    expect(result.code).toBe(`let delta = vec3f(alpha, beta, gamma);`);
  });
});
