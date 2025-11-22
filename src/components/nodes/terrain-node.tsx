import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.terrain;

function TerrainNode() {
  return (
    <TerrainGenNode.Root title="Terrain (Output)">
      <TerrainGenNode.HandleInput label="Height" handleId={HANDLES.in.height} valueType="f32" />
    </TerrainGenNode.Root>
  );
}

export default TerrainNode;
