import type * as util from './util';

// --------------------------------------------------------------------------------------------
// ------ Math/Utility
// --------------------------------------------------------------------------------------------

export type Math = {
  type: 'math';
  operation: 'add' | 'sub' | 'mult' | 'div';
  references: {
    readA: util.ReferenceKey;
    readB: util.ReferenceKey;
    write: util.ReferenceKey;
  };
};

export type Mix = {
  type: 'mix';
  references: {
    readA: util.ReferenceKey;
    readB: util.ReferenceKey;
    readMix: util.ReferenceKey;
    write: util.ReferenceKey;
  };
};

export type Smoothstep = {
  type: 'smoothstep';
  references: {
    readLow: util.ReferenceKey;
    readHigh: util.ReferenceKey;
    readValue: util.ReferenceKey;
    write: util.ReferenceKey;
  };
};

export type TrigMath = {
  type: 'trig-math';
  operation: 'sin' | 'cos' | 'tan';
  references: {
    read: util.ReferenceKey;
    write: util.ReferenceKey;
  };
};

export type SeparateXYZ = {
  type: 'separate-xyz';
  references: {
    read: util.ReferenceKey;
    writeX?: util.ReferenceKey;
    writeY?: util.ReferenceKey;
    writeZ?: util.ReferenceKey;
  };
};

export type CombineXYZ = {
  type: 'combine-xyz';
  references: {
    readX: util.ReferenceKey;
    readY: util.ReferenceKey;
    readZ: util.ReferenceKey;
    write: util.ReferenceKey;
  };
};

export type Transform = {
  type: 'transform';
  references: {
    geo: util.ReferenceKey;
    translate: util.ReferenceKey;
    rotate: util.ReferenceKey;
    scale: util.ReferenceKey;
    write: util.ReferenceKey;
  };
};

// TODO: ideally, all nodes will have uniforms for any non-plugged-in input plug.
//   This will have to do for now as a way of discretely creating uniforms.
export type Vector = {
  type: 'vector';
  references: {
    write: util.ReferenceKey;
  };
};

// --------------------------------------------------------------------------------------------
// ------ Noise
// --------------------------------------------------------------------------------------------

export type Noise = {
  type: 'noise';
  method: 'fbm' | 'worley';
  references: {
    pos: util.ReferenceKey;
    scale: util.ReferenceKey;
    numOctaves: util.ReferenceKey;
    write: util.ReferenceKey;
  };
};

export type All =
  | Math
  | Mix
  | Smoothstep
  | TrigMath
  | SeparateXYZ
  | CombineXYZ
  | Vector
  | Noise;
