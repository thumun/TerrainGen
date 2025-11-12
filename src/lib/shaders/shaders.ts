// this file loads all the shaders and preprocesses them with some common code
// stolen from hw 4

import commonRaw from './common.wgsl?raw';
import naiveFragRaw from './naive.fs.wgsl?raw';
import naiveVertRaw from './naive.vs.wgsl?raw';
import terrainCompute from './jit/templates/terrain.cs.wgsl?raw';

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
export const terrainComputeSrc: string = processShaderRaw(terrainCompute);
