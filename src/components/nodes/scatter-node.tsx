import { useReactFlow, type NodeProps } from 'reactflow';

import * as helpers from './helpers';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.scatter;
type ScatterNodeData = nodeTypes.Scatter['data'];

function ScatterNode({ id, data }: NodeProps<ScatterNodeData>) {
  const { setNodes } = useReactFlow();

  const onChange = (key: 'instances' | 'threshold', value: number) => {
    helpers.updateNodeData<ScatterNodeData>({ id, setNodes, newData: { [key]: value } });
  };

  return (
    <TerrainGenNode.Root title="Scatter">
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.result} valueType="vec3f[]" />

      <TerrainGenNode.NumberInput
        label="Instances"
        value={data.instances}
        valueType="u32"
        onChange={(newValue) => onChange('instances', newValue)}
      />

      <TerrainGenNode.HandleInput label="Mask" handleId={HANDLES.in.a} valueType="f32" />

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
