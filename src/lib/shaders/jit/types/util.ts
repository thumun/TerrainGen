export type ReferenceKey = string;

export type Uniform = {
  type: 'f32' | 'vec3f';
  key: ReferenceKey;
  group: number;
  binding: number;
};
