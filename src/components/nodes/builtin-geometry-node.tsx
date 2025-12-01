import { useReactFlow, type NodeProps } from 'reactflow';

import * as helpers from './helpers';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.builtinGeo;
type BuiltinGeometryData = nodeTypes.BuiltinGeometry['data'];

function BuiltInGeoNode({ id, data, ...props }: NodeProps<BuiltinGeometryData>) {
  const { setNodes } = useReactFlow();

  const onMeshPathChange = (value: string) => {
    helpers.updateNodeData<BuiltinGeometryData>({
      id,
      setNodes,
      newData: { meshPath: value },
    });
  };

  return (
    <TerrainGenNode.Root title="Built-in Geometry" {...props}>
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.result} valueType="geometry" />
      <TerrainGenNode.SelectInput
        label="Mesh"
        value={data.meshPath}
        onChange={onMeshPathChange}
        options={[
          { label: 'Tree', value: '/models/tree.obj' },
          { label: 'Rock', value: '/models/rock.obj' },
        ]}
      />
    </TerrainGenNode.Root>
  );
}

export default BuiltInGeoNode;
