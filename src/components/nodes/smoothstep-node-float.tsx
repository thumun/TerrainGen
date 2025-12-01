import type { NodeProps } from 'reactflow';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.smoothstepFloat;

function SmoothstepNodeFloat({ ...props }: NodeProps) {
  return (
    <TerrainGenNode.Root title="Smoothstep (Float)" {...props}>
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.result} valueType="f32" />

      <TerrainGenNode.HandleInput label="Low Edge" handleId={HANDLES.in.low} valueType="f32" />
      <TerrainGenNode.HandleInput
        label="High Edge"
        handleId={HANDLES.in.high}
        valueType="f32"
      />
      <TerrainGenNode.HandleInput label="Value" handleId={HANDLES.in.value} valueType="f32" />
    </TerrainGenNode.Root>
  );
}

export default SmoothstepNodeFloat;
