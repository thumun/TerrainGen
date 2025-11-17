import { describe, expect, it } from 'vitest';

import * as jit from '..';
import type * as shaders from '../types/shaders';

const mockDisplaceTemplate: shaders.DisplaceShaderTemplate = {
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

const mockDisplaceShaderConfig: shaders.DisplaceShaderConfig = {
  uniforms: [
    {
      key: 'unif1',
      type: 'f32',
      initialValue: null,
    },
    {
      key: 'unif2',
      type: 'vec3f',
      initialValue: null,
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

describe('generateDisplaceShaderCode', () => {
  it('matches the snapshot with mock vertex template', () => {
    const value = jit.generateDisplaceShaderCode(
      mockDisplaceShaderConfig,
      mockDisplaceTemplate,
    );

    expect(value).toMatchSnapshot();
  });
});
