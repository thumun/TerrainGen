import type { NodeProps } from 'reactflow';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.combine;

function CombineNode({ ...props }: NodeProps) {
  return (
    <TerrainGenNode.Root title="Combine XYZ" {...props}>
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.xyz} valueType="vec3f" />

      <TerrainGenNode.HandleInput label="X" handleId={HANDLES.in.x} valueType="f32" />
      <TerrainGenNode.HandleInput label="Y" handleId={HANDLES.in.y} valueType="f32" />
      <TerrainGenNode.HandleInput label="Z" handleId={HANDLES.in.z} valueType="f32" />
    </TerrainGenNode.Root>
  );
}

export default CombineNode;
