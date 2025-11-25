import type { NodeProps } from 'reactflow';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.separate;

function SeparateNode({ ...props }: NodeProps) {
  return (
    <TerrainGenNode.Root title="Separate XYZ" {...props}>
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.x} valueType="f32" />
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.y} valueType="f32" offset={1} />
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.z} valueType="f32" offset={2} />

      <TerrainGenNode.HandleInput label="XYZ" handleId={HANDLES.in.xyz} valueType="vec3f" />
    </TerrainGenNode.Root>
  );
}

export default SeparateNode;
