import { useReactFlow, type NodeProps } from 'reactflow';

import * as helpers from './helpers';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.float;
type FloatNodeData = nodeTypes.Float['data'];

function FloatNode({ id, data }: NodeProps<FloatNodeData>) {
  const { setNodes } = useReactFlow();

  const onChange = (value: number) => {
    helpers.updateNodeData<FloatNodeData>({ id, setNodes, newData: { value } });
  };

  return (
    <TerrainGenNode.Root title="Float">
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.result} valueType="f32" />
      <TerrainGenNode.NumberInput value={data.value} onChange={onChange} />
    </TerrainGenNode.Root>
  );
}

export default FloatNode;
