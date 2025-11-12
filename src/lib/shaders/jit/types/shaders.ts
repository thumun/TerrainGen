import type * as instructions from './instructions';
import type * as util from './util';

type ShaderConfigBase = {
  uniforms: Array<util.Uniform>;
  instructionSet: Array<instructions.All>;
};

export type VertexShaderConfig = ShaderConfigBase & {
  type: 'vertex';
  outputs: {
    height: util.ReferenceKey;
  };
};

type VertexShaderTemplateValues = {
  uniforms: string;
  bodyCode: string;
  heightKey: string;
};

export type VertexShaderTemplate = (values: VertexShaderTemplateValues) => string;
