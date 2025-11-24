import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.vertexData;

function VertexDataNode() {
  return (
    <TerrainGenNode.Root title="Vertex Data (Input)">
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.position} valueType="vec3f" />
    </TerrainGenNode.Root>
  );
}

export default VertexDataNode;
