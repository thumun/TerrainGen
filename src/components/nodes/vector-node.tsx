import { useReactFlow, type NodeProps } from 'reactflow';

import * as helpers from './helpers';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import { useGraphGlobals } from '@/hooks/use-graph-globals';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.vector;
type VectorNodeData = nodeTypes.Vector['data'];

function VectorNode({ id, data, ...props }: NodeProps<VectorNodeData>) {
  const { setNodes } = useReactFlow();
  const { setDisplacePipelineUniform } = useGraphGlobals();

  const onChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newData = { ...data, [axis]: value };
    helpers.updateNodeData<VectorNodeData>({ id, setNodes, newData });

    const uniformKey = `hdlkey_${id}_${HANDLES.out.result}`.replaceAll('-', '_');
    setDisplacePipelineUniform(uniformKey, [newData.x, newData.y, newData.z]);
  };

  return (
    <TerrainGenNode.Root title="Vector" {...props}>
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.result} valueType="vec3f" />

      <TerrainGenNode.NumberInput
        label="X"
        value={data.x}
        valueType="f32"
        onChange={(newValue) => onChange('x', newValue)}
      />
      <TerrainGenNode.NumberInput
        label="Y"
        value={data.y}
        valueType="f32"
        onChange={(newValue) => onChange('y', newValue)}
      />
      <TerrainGenNode.NumberInput
        label="Z"
        value={data.z}
        valueType="f32"
        onChange={(newValue) => onChange('z', newValue)}
      />
    </TerrainGenNode.Root>
  );
}

export default VectorNode;
