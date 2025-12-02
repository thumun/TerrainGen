import { useEffect } from 'react';
import { useReactFlow, useUpdateNodeInternals, type NodeProps } from 'reactflow';

import * as helpers from './helpers';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import { useGraphGlobals } from '@/hooks/use-graph-globals';
import * as nodeTypes from '@/lib/graph/node-types';

type MathNodeData = nodeTypes.Math['data'];
const HANDLES = { vec3f: nodeTypes.HANDLES.math, f32: nodeTypes.HANDLES.mathFloat };

function MathNode({ id, data, ...props }: NodeProps<MathNodeData>) {
  const { setNodes, getEdges, setEdges } = useReactFlow();
  const { triggerNodePipelineUpdate } = useGraphGlobals();
  const updateNodeInternals = useUpdateNodeInternals();

  const dataType: 'f32' | 'vec3f' = data.nodeType === 'Float' ? 'f32' : 'vec3f';
  const handles = HANDLES[dataType];

  const onOperationChange = (operationVal: MathNodeData['operationVal']) => {
    helpers.updateNodeData<MathNodeData>({ id, setNodes, newData: { operationVal } });
  };

  const onNodeTypeChange = (nodeType: MathNodeData['nodeType']) => {
    const edges = getEdges();
    const updatedEdges = edges.filter((edge) => edge.source !== id && edge.target !== id);
    setEdges(updatedEdges);

    helpers.updateNodeData<MathNodeData>({ id, setNodes, newData: { nodeType } });

    requestAnimationFrame(() => {
      updateNodeInternals(id);
    });
  };

  useEffect(() => {
    triggerNodePipelineUpdate(id);
  }, [data.operationVal, data.nodeType, id, triggerNodePipelineUpdate]);

  return (
    <TerrainGenNode.Root title="Math" {...props}>
      <TerrainGenNode.HandleOutput handleId={handles.out.result} valueType={dataType} />

      <TerrainGenNode.HandleInput
        label="Value A"
        handleId={handles.in.a}
        valueType={dataType}
      />
      <TerrainGenNode.HandleInput
        label="Value B"
        handleId={handles.in.b}
        valueType={dataType}
      />

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

      <TerrainGenNode.SelectInput
        label="Type"
        value={data.nodeType}
        onChange={onNodeTypeChange}
        options={[
          { label: 'Vec3', value: 'Vec3' },
          { label: 'Float', value: 'Float' },
        ]}
      />
    </TerrainGenNode.Root>
  );
}

export default MathNode;
