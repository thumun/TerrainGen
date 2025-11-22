import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.transform;

function TransformNode() {
  return (
    <TerrainGenNode.Root title="Transformation">
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
      {/* TODO: this "uniform scale" thing seems a bid redundant */}
      <TerrainGenNode.HandleInput
        label="Uniform Scale"
        handleId={HANDLES.in.uniformScale}
        valueType="f32"
      />
    </TerrainGenNode.Root>
  );
}

export default TransformNode;
