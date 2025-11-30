import { useReactFlow, type NodeProps } from 'reactflow';

import * as helpers from './helpers';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.loadGeo;
type LoadGeometryData = nodeTypes.LoadGeometry['data'];

function LoadGeoNode({ id, data }: NodeProps<LoadGeometryData>) {
  const { setNodes } = useReactFlow();

  const onMeshPathChange = (value: string) => {
    helpers.updateNodeData<LoadGeometryData>({
      id,
      setNodes,
      newData: { meshPath: value },
    });
  };

  return (
    <TerrainGenNode.Root title="Load Geometry">
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

export default LoadGeoNode;
