import { describe, expect, it } from 'vitest';

import * as jit from '..';
import { defaultVertexShaderTemplate } from '../templates/default.vert';
import type * as shaders from '../types/shaders';

const mockVertexTemplate: shaders.VertexShaderTemplate = ({
  uniforms,
  bodyCode,
  heightKey,
}) => `> UNIFORMS
${uniforms}

> BODY CODE
${bodyCode}

> HEIGHT KEY
${heightKey}
`;

const mockVertexShaderConfig: shaders.VertexShaderConfig = {
  type: 'vertex',
  uniforms: [
    { key: 'unif1', type: 'f32', group: 1, binding: 0 },
    { key: 'unif2', type: 'vec3f', group: 1, binding: 1 },
  ],
  instructionSet: [
    { type: 'separate-xyz', references: { read: 'unif2', writeX: 'unif2_y' } },
    {
      type: 'math',
      operation: 'add',
      references: { readA: 'unif1', readB: 'unif2_y', write: 'height_out' },
    },
  ],
  outputs: { height: 'height_out' },
};

describe('generateVertexShaderCode', () => {
  it('matches the snapshot with mock vertex template', () => {
    const value = jit.generateVertexShaderCode(mockVertexShaderConfig, mockVertexTemplate);

    expect(value).toMatchSnapshot();
  });

  it('matches the snapshot with default vertex template', () => {
    const value = jit.generateVertexShaderCode(
      mockVertexShaderConfig,
      defaultVertexShaderTemplate,
    );

    expect(value).toMatchSnapshot();
  });
});
