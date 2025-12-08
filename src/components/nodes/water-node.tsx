import type { NodeProps } from 'reactflow';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.water;

function WaterNode({ ...props }: NodeProps) {
  return (
    <TerrainGenNode.Root title="Water (Output)" {...props}>
      <TerrainGenNode.HandleInput label="Height" handleId={HANDLES.in.height} valueType="f32" />
    </TerrainGenNode.Root>
  );
}

export default WaterNode;
