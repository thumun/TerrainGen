// this file loads all the shaders and preprocesses them with some common code
// stolen from hw 4

import commonRaw from './common.wgsl?raw';
import instancePointsComputeRaw from './instance_points.cs.wgsl?raw';
import instancingRaw from './instancing.wgsl?raw';
import naiveFragRaw from './naive.fs.wgsl?raw';
import naiveVertRaw from './naive.vs.wgsl?raw';
import normalsComputeRaw from './normals.cs.wgsl?raw';
import shadowCastVertRaw from './shadow_cast.vs.wgsl?raw';
import shadowCastInstancedVertRaw from './shadow_cast_instanced.vs.wgsl?raw';
import terrainComputeRaw from './terrain.cs.wgsl?raw';
import waterComputeRaw from './water.cs.wgsl?raw';
import waterFragRaw from './water.fs.wgsl?raw';

// CONSTANTS (for use in shaders) (need to be hardcoded in deployed environment)

export const constants = {
  bindGroup_scene: 0,
};

// =================================

function evalShaderRaw(raw: string): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return eval('`' + raw.replaceAll('${', '${constants.') + '`');
}

const commonSrc = evalShaderRaw(commonRaw);

function processShaderRaw(raw: string) {
  return commonSrc + evalShaderRaw(raw);
}

export const naiveVertSrc: string = processShaderRaw(naiveVertRaw);
export const naiveFragSrc: string = processShaderRaw(naiveFragRaw);
export const terrainComputeSrc: string = processShaderRaw(terrainComputeRaw);
export const normalsComputeSrc: string = processShaderRaw(normalsComputeRaw);
export const terrainPointsComputeSrc: string = processShaderRaw(instancePointsComputeRaw);
export const instanceSrc: string = processShaderRaw(instancingRaw);
export const waterComputeSrc: string = processShaderRaw(waterComputeRaw);
export const waterFragSrc: string = processShaderRaw(waterFragRaw);
export const shadowCastVertSrc: string = processShaderRaw(shadowCastVertRaw);
export const shadowCastInstancedVertSrc: string = processShaderRaw(shadowCastInstancedVertRaw);
