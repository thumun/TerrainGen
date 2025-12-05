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

export type TransformConfig = {
  translate: string;
  rotate: string;
  scale: string;
};

export type InstancingShaderConfig = ShaderConfigBase & {
  outputs: {
    instanceCount: number;
    instancePositions: util.ReferenceKey;
    meshPath: string;
    fileContent?: string;
    transform?: TransformConfig;
    fileType?: string;
  };
};

type DisplaceShaderTemplateValues = {
  uniforms: string;
  utils: string;
  body: string;
  heightKey: string;
};

type InstancingShaderTemplateValues = {
  uniforms: string;
  utils: string;
  body: string;
  posKey: string;
  transformCode?: string;
};

export type DisplaceShaderTemplate = {
  content: (values: DisplaceShaderTemplateValues) => string;
};

export type InstancingShaderTemplate = {
  content: (values: InstancingShaderTemplateValues) => string;
};

/** Global input keys for use in instructions */
export const DISPLACE_SHADER_INPUT_KEYS = {
  /** `vec3f` - world position of the current terrain vertex */
  terrainPos: 'terrainPos',
};
