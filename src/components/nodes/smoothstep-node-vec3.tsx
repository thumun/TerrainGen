import type { NodeProps } from 'reactflow';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.smoothstepVec3;

function SmoothstepNodeVec3({ ...props }: NodeProps) {
  return (
    <TerrainGenNode.Root title="Smoothstep (Vec3)" {...props}>
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.result} valueType="vec3f" />

      <TerrainGenNode.HandleInput
        label="Low Edge"
        handleId={HANDLES.in.low}
        valueType="vec3f"
      />
      <TerrainGenNode.HandleInput
        label="High Edge"
        handleId={HANDLES.in.high}
        valueType="vec3f"
      />
      <TerrainGenNode.HandleInput label="Value" handleId={HANDLES.in.value} valueType="vec3f" />
    </TerrainGenNode.Root>
  );
}

export default SmoothstepNodeVec3;
