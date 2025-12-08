import { useEffect } from 'react';
import { useReactFlow, type NodeProps } from 'reactflow';

import * as helpers from './helpers';

import * as TerrainGenNode from '@/components/common/terraingen-node';
import { useGraphGlobals } from '@/hooks/use-graph-globals';
import * as nodeTypes from '@/lib/graph/node-types';

type TerrainNodeData = nodeTypes.Terrain['data'];
const HANDLES = nodeTypes.HANDLES.terrain;

function TerrainNode({ id, data, ...props }: NodeProps<TerrainNodeData>) {
  const { setNodes } = useReactFlow();
  const { triggerNodePipelineUpdate } = useGraphGlobals();

  const onBiomeChange = (biome: TerrainNodeData['biome']) => {
    helpers.updateNodeData<TerrainNodeData>({ id, setNodes, newData: { biome } });
  };

  useEffect(() => {
    triggerNodePipelineUpdate(id);
  }, [data.biome, id, triggerNodePipelineUpdate]);

  return (
    <TerrainGenNode.Root title="Terrain (Output)" {...props}>
      <TerrainGenNode.HandleInput label="Height" handleId={HANDLES.in.height} valueType="f32" />
      <TerrainGenNode.HandleInput
        label="Water Height"
        handleId={HANDLES.in.waterHeight}
        valueType="f32"
      />
      <TerrainGenNode.SelectInput
        label="Biome"
        value={data.biome}
        onChange={onBiomeChange}
        options={[
          { label: 'Grassland', value: 'Grassland' },
          { label: 'Desert', value: 'Desert' },
          { label: 'Mountain', value: 'Mountain' },
          { label: 'Tundra', value: 'Tundra' },
        ]}
      />
    </TerrainGenNode.Root>
  );
}

export default TerrainNode;
