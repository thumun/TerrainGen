import type * as util from './util';

export type Math = {
  type: 'math';
  operation: 'add' | 'sub' | 'mult' | 'div';
  references: {
    readA: util.ReferenceKey;
    readB: util.ReferenceKey;
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

export type All = Math | SeparateXYZ | CombineXYZ;
