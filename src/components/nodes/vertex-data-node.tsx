import type { NodeProps } from 'reactflow';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.vertexData;

function VertexDataNode({ ...props }: NodeProps) {
  return (
    <TerrainGenNode.Root title="Vertex Data (Input)" {...props}>
      <div className="pt-2 pr-2 text-right">Position</div>
      <TerrainGenNode.HandleOutput
        handleId={HANDLES.out.position}
        valueType="vec3f"
        // not what this is supposed to be used for lol but whatever
        offset={1.6}
      />
    </TerrainGenNode.Root>
  );
}

export default VertexDataNode;
