import { useReactFlow, type NodeProps } from 'reactflow';

import * as helpers from './helpers';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import * as nodeTypes from '@/lib/graph/node-types';

const HANDLES = nodeTypes.HANDLES.loadGeo;
type LoadGeometryData = nodeTypes.LoadGeometry['data'];

function LoadGeoNode({ id, ...props }: NodeProps<LoadGeometryData>) {
  const { setNodes } = useReactFlow();

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      void (async () => {
        const fileInfo = await file.text();

        helpers.updateNodeData<LoadGeometryData>({
          id,
          setNodes,
          newData: {
            meshPath: file.name,
            fileContent: fileInfo,
          },
        });
      })();
    } catch (error) {
      console.error('Error reading file:', error);
    }
  };

  return (
    <TerrainGenNode.Root title="Load Geometry" {...props}>
      <TerrainGenNode.HandleOutput handleId={HANDLES.out.result} valueType="geometry" />
      <div className="noDrag relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <input
          type="file"
          accept=".obj"
          onChange={onFileChange}
          className="text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
        />
      </div>
    </TerrainGenNode.Root>
  );
}

export default LoadGeoNode;
