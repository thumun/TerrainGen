import { useReactFlow, type NodeProps } from 'reactflow';

import * as helpers from './helpers';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

type MathVec3NodeData = nodeTypes.MathVec3['data'];
const HANDLES = nodeTypes.HANDLES.mathVec3;

function MathNodeVec3({ id, data, ...props }: NodeProps<MathVec3NodeData>) {
  const { setNodes } = useReactFlow();

  const onOperationChange = (operationVal: MathVec3NodeData['operationVal']) => {
    helpers.updateNodeData<MathVec3NodeData>({ id, setNodes, newData: { operationVal } });
  };

  return (
    <TerrainGenNode.Root title="Math (Vec3)" {...props}>
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.result} valueType="vec3f" />

      <TerrainGenNode.HandleInput label="Value A" handleId={HANDLES.in.a} valueType="vec3f" />
      <TerrainGenNode.HandleInput label="Value B" handleId={HANDLES.in.b} valueType="vec3f" />

      <TerrainGenNode.SelectInput
        label="Mode"
        value={data.operationVal}
        onChange={onOperationChange}
        options={[
          { label: 'Add', value: 'Add' },
          { label: 'Subtract', value: 'Sub' },
          { label: 'Multiply', value: 'Mult' },
          { label: 'Divide', value: 'Div' },
        ]}
      />
    </TerrainGenNode.Root>
  );
}

export default MathNodeVec3;
