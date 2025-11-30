import { useState } from 'react';

import NodeGraph from './node-graph';
import NodeGraphCanvas from './node-graph-canvas';
import TerrainCanvas from './terrain-canvas';
import TerrainSliders from './terrain-sliders';
import Toolbar from './toolbar';

import * as scene from '@/lib/scene';

export default function Editor() {
  const [displacePipelineConfig, setDisplacePipelineConfig] = useState<
    scene.DisplacePipeline | undefined
  >(undefined);

  const [instancingPipelineConfig, setInstancingPipelineConfig] = useState<
    scene.InstancingPipeline | undefined
  >();

  // @ts-expect-error not setting this yet
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [previewNodes, setPreviewNodes] = useState([{ bar: 'foo' }]);
  // This "preview nodes" data should be computed from the scene graph.

  // states for size and resolution...

  const [globalParams, setGlobalParams] = useState({
    size: 10,
    resolution: 100,
  });

  return (
    <div className="mx-auto grid h-screen max-h-[1800px] w-full max-w-[2400px] grid-rows-[auto_1fr] overflow-hidden">
      <header className="bg-zinc-700 px-8 py-4">
        <h1 className="text-2xl font-bold tracking-tight">TerrainGen</h1>
      </header>
      <main className="grid grow grid-cols-[3fr_minmax(560px,2fr)] bg-zinc-800">
        {/* Left column */}
        <div className="flex flex-col">
          <Toolbar />
          <div className="relative grow">
            <NodeGraphCanvas previewNodes={previewNodes} />
            <NodeGraph
              onDisplacePipelineUpdate={setDisplacePipelineConfig}
              onInstancingPipelineUpdate={setInstancingPipelineConfig}
            />
          </div>
        </div>

        {/* Right column */}
        <div className="relative flex flex-col overflow-clip border-l-2 border-zinc-900">
          <div className="relative aspect-4/3">
            <TerrainCanvas
              displacePipeline={displacePipelineConfig}
              instancingPipeline={instancingPipelineConfig}
              globalParams={globalParams}
            />
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
