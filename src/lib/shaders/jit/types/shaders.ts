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
  utils: string;
  body: string;
  heightKey: string;
};

export type VertexShaderTemplate = {
  content: (values: VertexShaderTemplateValues) => string;
  /** Can be used as `ReferenceKey`s in `VertexShaderConfig`s to refer to certain in-scope variables */
  localKeys: {
    /** `vec3f` - the terrain position for any given vertex */
    terrainPos: util.ReferenceKey;
  };
};
