import { useReactFlow, type NodeProps } from 'reactflow';

import * as helpers from './helpers';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.vector;
type VectorNodeData = nodeTypes.Vector['data'];

function VectorNode({ id, data }: NodeProps<VectorNodeData>) {
  const { setNodes } = useReactFlow();

  const onChange = (axis: 'x' | 'y' | 'z', value: number) => {
    helpers.updateNodeData<VectorNodeData>({ id, setNodes, newData: { [axis]: value } });
  };

  return (
    <TerrainGenNode.Root title="Vector">
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.result} valueType="vec3f" />

      <TerrainGenNode.NumberInput
        label="X"
        value={data.x}
        onChange={(newValue) => onChange('x', newValue)}
      />
      <TerrainGenNode.NumberInput
        label="Y"
        value={data.y}
        onChange={(newValue) => onChange('y', newValue)}
      />
      <TerrainGenNode.NumberInput
        label="Z"
        value={data.z}
        onChange={(newValue) => onChange('z', newValue)}
      />
    </TerrainGenNode.Root>
  );
}

export default VectorNode;
