import { useReactFlow, type NodeProps } from 'reactflow';

import * as helpers from './helpers';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

type NoiseNodeData = nodeTypes.Noise['data'];
const HANDLES = nodeTypes.HANDLES.noise;

function NoiseNode({ id, data }: NodeProps<NoiseNodeData>) {
  const { setNodes } = useReactFlow();

  const onModeChange = (mode: NoiseNodeData['mode']) => {
    helpers.updateNodeData<NoiseNodeData>({ id, setNodes, newData: { mode } });
  };

  return (
    <TerrainGenNode.Root title="Noise">
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.result} valueType="f32" />

      <TerrainGenNode.HandleInput
        label="Position"
        handleId={HANDLES.in.position}
        valueType="vec3f"
      />
      <TerrainGenNode.HandleInput
        label="Octave Count"
        handleId={HANDLES.in.numOctaves}
        valueType="u32"
      />
      <TerrainGenNode.HandleInput label="Scale" handleId={HANDLES.in.scale} valueType="f32" />

      <TerrainGenNode.SelectInput
        label="Mode"
        value={data.mode}
        onChange={onModeChange}
        options={[{ label: 'FBM', value: 'FBM' }]}
      />
    </TerrainGenNode.Root>
  );
}

export default NoiseNode;
