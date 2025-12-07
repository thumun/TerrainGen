import type { NodeProps } from 'reactflow';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.terrain;

function TerrainNode({ ...props }: NodeProps) {
  return (
    <TerrainGenNode.Root title="Terrain (Output)" {...props}>
      <TerrainGenNode.HandleInput label="Height" handleId={HANDLES.in.height} valueType="f32" />
      <TerrainGenNode.HandleInput
        label="Water Height"
        handleId={HANDLES.in.waterHeight}
        valueType="f32"
      />
    </TerrainGenNode.Root>
  );
}

export default TerrainNode;
