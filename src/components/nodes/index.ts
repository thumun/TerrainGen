import type { NodeTypes } from 'reactflow';

import CombineNode from './combine-node';
import FloatNode from './float-node';
import MathNodeFloat from './math-node-float';
import MathNodeVec3 from './math-node-vec3';
import MixNodeFloat from './mix-node-float';
import MixNodeVec3 from './mix-node-vec3';
import NoiseNode from './noise-node';
import SeparateNode from './separate-node';
import TerrainNode from './terrain-node';
import TransformNode from './transform-node';
import VectorNode from './vector-node';

export const nodeTypes: NodeTypes = {
  transform: TransformNode,
  noise: NoiseNode,
  mathFloat: MathNodeFloat,
  mathVec3: MathNodeVec3,
  mixFloat: MixNodeFloat,
  mixVec3: MixNodeVec3,
  terrain: TerrainNode,
  vector: VectorNode,
  separate: SeparateNode,
  combine: CombineNode,
  float: FloatNode,
};
