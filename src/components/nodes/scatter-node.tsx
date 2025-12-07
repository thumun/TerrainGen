import { useEffect } from 'react';
import { useReactFlow, type NodeProps } from 'reactflow';

import * as helpers from './helpers';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import { useGraphGlobals } from '@/hooks/use-graph-globals';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.scatter;
type ScatterNodeData = nodeTypes.Scatter['data'];

function ScatterNode({ id, data, ...props }: NodeProps<ScatterNodeData>) {
  const { setNodes } = useReactFlow();
  const { triggerNodePipelineUpdate } = useGraphGlobals();

  const onChange = (key: 'instances' | 'threshold', value: number) => {
    helpers.updateNodeData<ScatterNodeData>({ id, setNodes, newData: { [key]: value } });
  };

  useEffect(() => {
    triggerNodePipelineUpdate(id);
  }, [data.instances, data.threshold, id, triggerNodePipelineUpdate]);

  return (
    <TerrainGenNode.Root title="Scatter" {...props}>
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.result} valueType="vec3f[]" />

      <TerrainGenNode.NumberInput
        label="Instances"
        value={data.instances}
        valueType="u32"
        onChange={(newValue) => onChange('instances', newValue)}
        min={1}
      />

      <TerrainGenNode.HandleInput label="Terrain" handleId={HANDLES.in.a} valueType="f32" />

      <TerrainGenNode.NumberInput
        label="Threshold"
        value={data.threshold}
        valueType="f32"
        onChange={(newValue) => onChange('threshold', newValue)}
      />
    </TerrainGenNode.Root>
  );
}

export default ScatterNode;
