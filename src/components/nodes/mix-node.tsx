import { useReactFlow, useUpdateNodeInternals, type NodeProps } from 'reactflow';

import * as helpers from './helpers';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

type MixNodeData = nodeTypes.MixVec3['data'];

const HANDLES = { vec3f: nodeTypes.HANDLES.mixVec3, f32: nodeTypes.HANDLES.mixFloat };

function MixNode({ id, data, ...props }: NodeProps<MixNodeData>) {
  const { setNodes, getEdges, setEdges } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const dataType: 'f32' | 'vec3f' = data.nodeType === 'Float' ? 'f32' : 'vec3f';
  const handles = HANDLES[dataType];

  const onNodeTypeChange = (nodeType: MixNodeData['nodeType']) => {
    const edges = getEdges();
    const updatedEdges = edges.filter((edge) => edge.source !== id && edge.target !== id);
    setEdges(updatedEdges);

    helpers.updateNodeData<MixNodeData>({ id, setNodes, newData: { nodeType } });

    requestAnimationFrame(() => {
      updateNodeInternals(id);
    });
  };

  return (
    <TerrainGenNode.Root title="Mix" {...props}>
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
      <TerrainGenNode.HandleInput label="Mix Value" handleId={handles.in.mix} valueType="f32" />
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

export default MixNode;
