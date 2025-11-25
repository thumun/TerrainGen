import type { NodeProps } from 'reactflow';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.mixVec3;

function MixNodeVec3({ ...props }: NodeProps) {
  return (
    <TerrainGenNode.Root title="Mix (Vec3)" {...props}>
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.result} valueType="vec3f" />

      <TerrainGenNode.HandleInput label="Value A" handleId={HANDLES.in.a} valueType="vec3f" />
      <TerrainGenNode.HandleInput label="Value B" handleId={HANDLES.in.b} valueType="vec3f" />
      <TerrainGenNode.HandleInput label="Mix Value" handleId={HANDLES.in.mix} valueType="f32" />
    </TerrainGenNode.Root>
  );
}

export default MixNodeVec3;
