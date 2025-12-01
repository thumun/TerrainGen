import { useEffect } from 'react';
import { useReactFlow, type NodeProps } from 'reactflow';

import * as helpers from './helpers';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import { useGraphGlobals } from '@/hooks/use-graph-globals';
import * as nodeTypes from '@/lib/graph/node-types';

type TrigMathNodeData = nodeTypes.TrigMathFloat['data'];
const HANDLES = nodeTypes.HANDLES.trigMathFloat;

function TrigMathNodeFloat({ id, data, ...props }: NodeProps<TrigMathNodeData>) {
  const { setNodes } = useReactFlow();
  const { triggerNodePipelineUpdate } = useGraphGlobals();

  const onOperationChange = (operationVal: TrigMathNodeData['operationVal']) => {
    helpers.updateNodeData<TrigMathNodeData>({ id, setNodes, newData: { operationVal } });
  };

  useEffect(() => {
    triggerNodePipelineUpdate(id);
  }, [data.operationVal, id, triggerNodePipelineUpdate]);

  return (
    <TerrainGenNode.Root title="Trig Math (Float)" {...props}>
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.result} valueType="f32" />

      <TerrainGenNode.HandleInput label="Value" handleId={HANDLES.in.input} valueType="f32" />

      <TerrainGenNode.SelectInput
        label="Operation"
        value={data.operationVal}
        onChange={onOperationChange}
        options={[
          { label: 'Sine', value: 'Sin' },
          { label: 'Cosine', value: 'Cos' },
          { label: 'Tangent', value: 'Tan' },
        ]}
      />
    </TerrainGenNode.Root>
  );
}

export default TrigMathNodeFloat;
