import * as jitShaders from '@/lib/shaders/jit/types/shaders';
// TODO: design and implement node data structure
// Initial ideas: node connections (outputs to inputs) are always one to many.
//  node inputs should own these references.

export type DisplacePipeline = jitShaders.DisplaceShaderConfig;

export type InstancingPipeline = jitShaders.InstancingShaderConfig;

export type TransformConfig = jitShaders.TransformConfig;

export type PreviewNode = {
  bar: string;
};
