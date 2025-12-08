import { useCallback, useMemo, useRef, useState } from 'react';
import type { Node } from 'reactflow';

import NodeGraph from './node-graph';
import NodeGraphCanvas from './node-graph-canvas';
import TerrainCanvas from './terrain-canvas';
import TerrainSliders from './terrain-sliders';
import type { GlobalParams } from './terrain-sliders';
import Toolbar from './toolbar';
import type { ToolbarProps } from './toolbar';

import { useNodeGraph } from '@/hooks/use-node-graph';
import { usePipelines } from '@/hooks/use-pipelines';
import type { PipelineNode } from '@/lib/graph';
import type * as nodeTypes from '@/lib/graph/node-types';
import type { TerrainRenderer } from '@/lib/renderers/terrain-renderer';

const initialNodes: (Node & nodeTypes.All)[] = [
  {
    id: 'vertex-data-in',
    position: { x: -250, y: 0 },
    type: 'vertexData',
    data: {},
  },
  {
    id: 'terrain-out',
    position: { x: 250, y: 0 },
    type: 'terrain',
    data: {},
  },
];

export default function Editor() {
  const terrainRendererRef = useRef<TerrainRenderer | undefined>(undefined);
  const { setUniform, rebuildPipelinesFromNode, rebuildAllPipelines } = usePipelines({
    terrainRendererRef,
  });

  // states for size and resolution...
  const [globalParams, setGlobalParams] = useState<GlobalParams>({
    size: 20,
    resolution: 100,
    fog: {
      intensity: 0.08,
      color: [0.686, 0.702, 0.725],
    },
  });

  // hook owning node + edge state, and react flow
  const nodeGraph = useNodeGraph({ initialNodes });

  // TODO: figure out preview nodes
  const previewNodes = useMemo(() => [], []);

  // callbacks for toolbar
  const onLoadScene = useCallback<ToolbarProps['onLoadScene']>(
    ({ nodes, edges }) => rebuildAllPipelines({ nodes: nodes as PipelineNode[], edges }),
    [rebuildAllPipelines],
  );

  return (
    <div className="mx-auto grid h-screen max-h-[1800px] w-full max-w-[2400px] grid-rows-[auto_1fr] overflow-hidden">
      <header className="bg-zinc-700 px-8 py-4">
        <h1 className="text-2xl font-bold tracking-tight">TerrainGen</h1>
      </header>
      <main className="grid grow grid-cols-[3fr_minmax(560px,2fr)] bg-zinc-800">
        {/* Left column */}
        <div className="flex flex-col">
          <Toolbar
            nodeGraph={nodeGraph}
            onLoadScene={onLoadScene}
            terrainRendererRef={terrainRendererRef}
          />
          <div className="relative grow">
            <NodeGraphCanvas previewNodes={previewNodes} />
            <NodeGraph
              nodeGraph={nodeGraph}
              rebuildPipelinesFromNode={rebuildPipelinesFromNode}
              onUniformUpdate={setUniform}
            />
          </div>
        </div>

        {/* Right column */}
        <div className="relative flex flex-col overflow-clip border-l-2 border-zinc-900">
          <div className="relative aspect-4/3">
            <TerrainCanvas rendererRef={terrainRendererRef} globalParams={globalParams} />
          </div>
          <div className="relative grow">
            <div className="absolute inset-0 overflow-y-auto px-8 py-4">
              <h2 className="text-xl font-medium">Global Parameters</h2>
              <TerrainSliders globalParams={globalParams} setGlobalParams={setGlobalParams} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
