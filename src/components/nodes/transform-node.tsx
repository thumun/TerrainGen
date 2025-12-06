import type { NodeProps } from 'reactflow';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.transform;

function TransformNode({ ...props }: NodeProps) {
  return (
    <TerrainGenNode.Root title="Transformation" {...props}>
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.result} valueType="geometry" />

      <TerrainGenNode.HandleInput
        label="Geometry"
        handleId={HANDLES.in.geo}
        valueType="geometry"
      />
      <TerrainGenNode.HandleInput
        label="Translate"
        handleId={HANDLES.in.translate}
        valueType="vec3f"
      />
      <TerrainGenNode.HandleInput
        label="Rotate"
        handleId={HANDLES.in.rotate}
        valueType="vec3f"
      />
      <TerrainGenNode.HandleInput label="Scale" handleId={HANDLES.in.scale} valueType="vec3f" />
    </TerrainGenNode.Root>
  );
}

export default TransformNode;
