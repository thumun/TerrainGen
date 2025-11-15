import { describe, expect, it } from 'vitest';

import * as jit from '..';
import type * as shaders from '../types/shaders';

const mockVertexTemplate: shaders.VertexShaderTemplate = {
  content: ({ uniforms, utils, body, heightKey }) => `> UNIFORMS
${uniforms}

> UTILS
${utils}

> BODY CODE
${body}

> HEIGHT KEY
${heightKey}
`,
  localKeys: { terrainPos: 'test_terrain_pos' },
};

const mockVertexShaderConfig: shaders.VertexShaderConfig = {
  type: 'vertex',
  uniforms: [
    {
      key: 'unif1',
      type: 'f32',
      group: 1,
      binding: 0,
      value: null,
    },
    {
      key: 'unif2',
      type: 'vec3f',
      group: 1,
      binding: 1,
      value: null,
    },
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
});
