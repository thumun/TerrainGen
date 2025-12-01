import type { NodeProps } from 'reactflow';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.mixFloat;

function MixNodeFloat({ ...props }: NodeProps) {
  return (
    <TerrainGenNode.Root title="Mix (Float)" {...props}>
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.result} valueType="f32" />

      <TerrainGenNode.HandleInput label="Value A" handleId={HANDLES.in.a} valueType="f32" />
      <TerrainGenNode.HandleInput label="Value B" handleId={HANDLES.in.b} valueType="f32" />
      <TerrainGenNode.HandleInput label="Mix Value" handleId={HANDLES.in.mix} valueType="f32" />
    </TerrainGenNode.Root>
  );
}

export default MixNodeFloat;
