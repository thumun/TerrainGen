export type ReferenceKey = string;

export type UniformConfig = {
  type: 'f32' | 'u32' | 'vec3f';
  key: ReferenceKey;
  group: number;
  binding: number;
  value: number | [number, number, number] | null;
};
