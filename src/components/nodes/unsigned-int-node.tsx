import { useReactFlow, type NodeProps } from 'reactflow';

import * as helpers from './helpers';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import { useGraphGlobals } from '@/hooks/use-graph-globals';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.unsignedInt;
type UnsignedIntNodeData = nodeTypes.UnsignedInt['data'];

function UnsignedIntNode({ id, data, ...props }: NodeProps<UnsignedIntNodeData>) {
  const { setNodes } = useReactFlow();
  const { setUniform } = useGraphGlobals();

  const onChange = (value: number) => {
    helpers.updateNodeData<UnsignedIntNodeData>({ id, setNodes, newData: { value } });

    const uniformKey = `hdlkey_${id}_${HANDLES.out.result}`.replaceAll('-', '_');
    if (setUniform) setUniform(uniformKey, value);
  };

  return (
    <TerrainGenNode.Root title="Unsigned Int" {...props}>
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.result} valueType="u32" />
      <TerrainGenNode.NumberInput value={data.value} valueType="u32" onChange={onChange} />
    </TerrainGenNode.Root>
  );
}

export default UnsignedIntNode;
