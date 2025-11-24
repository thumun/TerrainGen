import type * as instructions from './instructions';
import type * as util from './util';

type ShaderConfigBase = {
  uniforms: Array<util.UniformConfig>;
  instructionSet: Array<instructions.All>;
};

// --------------------------------------------------------------------------------------------
// ------ DISPLACE SHADER CONFIG
// --------------------------------------------------------------------------------------------

export type DisplaceShaderConfig = ShaderConfigBase & {
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
};

/** Global input keys for use in instructions */
export const DISPLACE_SHADER_INPUT_KEYS = {
  /** `vec3f` - world position of the current terrain vertex */
  terrainPos: 'terrainPos',
};
