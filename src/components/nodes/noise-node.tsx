import { useEffect } from 'react';
import { useReactFlow, type NodeProps } from 'reactflow';

import * as helpers from './helpers';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import { useGraphGlobals } from '@/hooks/use-graph-globals';
import * as nodeTypes from '@/lib/graph/node-types';

type NoiseNodeData = nodeTypes.Noise['data'];
const HANDLES = nodeTypes.HANDLES.noise;

function NoiseNode({ id, data, ...props }: NodeProps<NoiseNodeData>) {
  const { setNodes } = useReactFlow();
  const { triggerNodePipelineUpdate } = useGraphGlobals();

  const onModeChange = (mode: NoiseNodeData['mode']) => {
    helpers.updateNodeData<NoiseNodeData>({ id, setNodes, newData: { mode } });
  };

  useEffect(() => {
    triggerNodePipelineUpdate(id);
  }, [data.mode, id, triggerNodePipelineUpdate]);

  return (
    <TerrainGenNode.Root title="Noise" {...props}>
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
        options={[
          { label: 'FBM', value: 'FBM' },
          { label: 'Worley', value: 'Worley' },
        ]}
      />
    </TerrainGenNode.Root>
  );
}

export default NoiseNode;
