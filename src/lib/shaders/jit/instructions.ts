import type { ReferenceKey } from './types';

export type Math = {
  type: 'math';
  operation: 'add' | 'sub' | 'mult' | 'div';
  references: {
    readA: ReferenceKey;
    readB: ReferenceKey;
    write: ReferenceKey;
  };
};

export type SeparateXYZ = {
  type: 'separate-xyz';
  references: {
    read: ReferenceKey;
    writeX?: ReferenceKey;
    writeY?: ReferenceKey;
    writeZ?: ReferenceKey;
  };
};

export type CombineXYZ = {
  type: 'combine-xyz';
  references: {
    readX: ReferenceKey;
    readY: ReferenceKey;
    readZ: ReferenceKey;
    write: ReferenceKey;
  };
};

export type All = Math | SeparateXYZ | CombineXYZ;
