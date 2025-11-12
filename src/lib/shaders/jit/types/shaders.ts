import type * as instructions from './instructions';
import type * as util from './util';

type ShaderConfigBase = {
  uniforms: Array<util.Uniform>;
  instructionSet: Array<instructions.All>;
};

export type DisplaceShaderConfig = ShaderConfigBase & {
  type: 'vertex';
  outputs: {
    height: util.ReferenceKey;
  };
};

type DisplaceShaderTemplateValues = {
  uniforms: string;
  utils: string;
  body: string;
  heightKey: string;
};

export type DisplaceShaderTemplate = {
  content: (values: DisplaceShaderTemplateValues) => string;
  /** Can be used as `ReferenceKey`s in `DisplaceShaderConfig`s to refer to certain in-scope variables */
  localKeys: {
    /** `vec3f` - the terrain position for any given vertex */
    terrainPos: util.ReferenceKey;
  };
};
