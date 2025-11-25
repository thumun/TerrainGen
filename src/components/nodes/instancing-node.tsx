import type { NodeProps } from 'node_modules/@reactflow/core/dist/esm/types/nodes';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.instancing;
type InstancingNodeData = nodeTypes.Instancing['data'];

function InstancingNode({ id, data }: NodeProps<InstancingNodeData>) {
  return (
    <TerrainGenNode.Root title="Instancing (Output)">
      <TerrainGenNode.HandleInput
        label="Position"
        handleId={HANDLES.in.position}
        valueType="vec3f[]"
      />

      {/* <TerrainGenNode.HandleInput
        label="Mesh ID"
        handleId={HANDLES.in.meshId}
        valueType="u32"
      /> */}
    </TerrainGenNode.Root>
  );
}

export default InstancingNode;
