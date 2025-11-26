import { useReactFlow, type NodeProps } from 'reactflow';

import * as helpers from './helpers';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.geometry;
type GeometryNodeData = nodeTypes.Geometry['data'];

function GeometryNode({ id, data }: NodeProps<GeometryNodeData>) {
  const { setNodes } = useReactFlow();

  const onMeshPathChange = (value: string) => {
    helpers.updateNodeData<GeometryNodeData>({ id, setNodes, newData: { meshPath: value } });
  };

  return (
    <TerrainGenNode.Root title="Geometry">
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.result} valueType="geometry" />
      <TerrainGenNode.SelectInput
        label="Mesh"
        value={data.meshPath}
        onChange={onMeshPathChange}
        options={[
          { label: 'Cube', value: '/models/cube.obj' },
          { label: 'Teapot', value: '/models/teapot.obj' },
        ]}
      />
    </TerrainGenNode.Root>
  );
}

export default GeometryNode;
