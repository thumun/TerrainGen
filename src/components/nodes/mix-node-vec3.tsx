import { useState } from 'react';
import { useReactFlow, type NodeProps } from 'reactflow';

import * as helpers from './helpers';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

type MixNodeData = nodeTypes.MixVec3['data'];

const HANDLES = { vec3f: nodeTypes.HANDLES.mixVec3, f32: nodeTypes.HANDLES.mixFloat };

function MixNodeVec3({ id, data, ...props }: NodeProps<MixNodeData>) {
  const { setNodes } = useReactFlow();

  const [dataType, setDataType] = useState<'f32' | 'vec3f'>('f32');
  const handles = HANDLES[dataType];

  const onNodeTypeChange = (nodeType: MixNodeData['nodeType']) => {
    helpers.updateNodeData<MixNodeData>({ id, setNodes, newData: { nodeType } });
    if (nodeType === 'Float') {
      setDataType('f32');
    } else {
      setDataType('vec3f');
    }
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

export default MixNodeVec3;
