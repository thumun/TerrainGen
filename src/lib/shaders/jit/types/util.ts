export type ReferenceKey = string;

export type UniformConfigBase = {
  key: ReferenceKey;
};

type UniformConfigScalar = UniformConfigBase & {
  type: 'f32' | 'u32';
  initialValue: number | null;
};

type UniformConfigVec3 = UniformConfigBase & {
  type: 'vec3f';
  initialValue: [number, number, number] | null;
};

export type UniformConfig = UniformConfigScalar | UniformConfigVec3;
