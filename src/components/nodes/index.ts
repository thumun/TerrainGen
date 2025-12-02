import type { NodeTypes } from 'reactflow';

import BuiltInGeoNode from './builtin-geometry-node';
import CombineNode from './combine-node';
import FloatNode from './float-node';
import InstancingNode from './instancing-node';
import LoadGeoNode from './load-geometry-node';
import MathNode from './math-node';
import MixNode from './mix-node';
import NoiseNode from './noise-node';
import PrimGeoNode from './primitive-geometry-node';
import ScatterNode from './scatter-node';
import SeparateNode from './separate-node';
import SmoothstepNodeFloat from './smoothstep-node-float';
import SmoothstepNodeVec3 from './smoothstep-node-vec3';
import TerrainNode from './terrain-node';
import TransformNode from './transform-node';
import TrigMathNodeFloat from './trig-math-node';
import UnsignedIntNode from './unsigned-int-node';
import VectorNode from './vector-node';
import VertexDataNode from './vertex-data-node';

export const nodeTypes: NodeTypes = {
  transform: TransformNode,
  noise: NoiseNode,
  trigMathFloat: TrigMathNodeFloat,
  math: MathNode,
  mix: MixNode,
  smoothstepFloat: SmoothstepNodeFloat,
  smoothstepVec3: SmoothstepNodeVec3,
  vertexData: VertexDataNode,
  terrain: TerrainNode,
  vector: VectorNode,
  separate: SeparateNode,
  combine: CombineNode,
  float: FloatNode,
  primGeo: PrimGeoNode,
  scatter: ScatterNode,
  instancing: InstancingNode,
  unsignedInt: UnsignedIntNode,
  loadGeo: LoadGeoNode,
  builtinGeo: BuiltInGeoNode,
};
