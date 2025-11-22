import { useReactFlow, type NodeProps } from 'reactflow';

import * as helpers from './helpers';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

type MathNodeData = nodeTypes.MathFloat['data'];
const HANDLES = nodeTypes.HANDLES.mathFloat;

function MathNodeFloat({ id, data }: NodeProps<MathNodeData>) {
  const { setNodes } = useReactFlow();

  const onOperationChange = (operationVal: MathNodeData['operationVal']) => {
    helpers.updateNodeData<MathNodeData>({ id, setNodes, newData: { operationVal } });
  };

  return (
    <TerrainGenNode.Root title="Math (Float)">
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.result} valueType="f32" />

      <TerrainGenNode.HandleInput label="Value A" handleId={HANDLES.in.a} valueType="f32" />
      <TerrainGenNode.HandleInput label="Value B" handleId={HANDLES.in.b} valueType="f32" />

      <TerrainGenNode.SelectInput
        label="Mode"
        value={data.operationVal}
        onChange={onOperationChange}
        options={[
          { label: 'Add', value: 'Add' },
          { label: 'Subtract', value: 'Sub' },
          { label: 'Multiply', value: 'Mult' },
          { label: 'Divide', value: 'Div' },
          // { label: 'Min', value: 'Min' },
          // { label: 'Max', value: 'Max' },
        ]}
      />
    </TerrainGenNode.Root>
  );
}

export default MathNodeFloat;
