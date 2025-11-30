import * as types from './types';

export const VALUE_TYPE_CLASSNAMES: Record<types.ValueType, string> = {
  f32: '!bg-blue-500',
  u32: '!bg-orange-500',
  vec3f: '!bg-green-500',
  geometry: '!bg-pink-500',
  'vec3f[]': '!bg-gray-700',
};
