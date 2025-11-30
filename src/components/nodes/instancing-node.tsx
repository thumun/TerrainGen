import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.instancing;

function InstancingNode() {
  return (
    <TerrainGenNode.Root title="Instancing (Output)">
      <TerrainGenNode.HandleInput
        label="Position"
        handleId={HANDLES.in.position}
        valueType="vec3f[]"
      />

      <TerrainGenNode.HandleInput
        label="Geometry"
        handleId={HANDLES.in.geometry}
        valueType="geometry"
      />

      <TerrainGenNode.HandleInput
        label="Instance Count"
        handleId={HANDLES.in.instCount}
        valueType="u32"
      />
    </TerrainGenNode.Root>
  );
}

export default InstancingNode;
