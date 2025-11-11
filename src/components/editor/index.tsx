import { useState } from 'react';

import NodeGraphCanvas from './node-graph-canvas';
import TerrainCanvas from './terrain-canvas';

import NodeGraph from '@/components/NodeGraph';

export default function Editor() {
  // @ts-expect-error not setting this yet
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sceneGraph, setSceneGraph] = useState({ foo: 'bar' });

  // the above state could come from a number of places... we could store it in the URL even!

  // @ts-expect-error not setting this yet
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [previewNodes, setPreviewNodes] = useState([{ bar: 'foo' }]);
  // This "preview nodes" data should be computed from the scene graph.

  return (
    <div className="mx-auto grid h-screen max-h-[1800px] w-full max-w-[2400px] grid-rows-[auto_1fr] overflow-hidden">
      <header className="bg-zinc-700 px-8 py-4">
        <h1 className="text-2xl font-bold tracking-tight">TerrainGen</h1>
      </header>
      <main className="grid grow grid-cols-[3fr_minmax(560px,2fr)] bg-zinc-800">
        {/* Left column */}
        <div className="flex flex-col">
          <div className="border-b-2 border-zinc-900 bg-zinc-900 px-4 py-2 text-zinc-400">
            Toolbar or something goes here
          </div>
          <div className="relative grow">
            <NodeGraphCanvas previewNodes={previewNodes} />
            <NodeGraph />
          </div>
        </div>

        {/* Right column */}
        <div className="relative flex flex-col overflow-clip border-l-2 border-zinc-900">
          <div className="relative aspect-4/3">
            <TerrainCanvas sceneGraph={sceneGraph} />
          </div>
          <div className="relative grow">
            <div className="absolute inset-0 overflow-y-auto px-8 py-4">
              <h2 className="text-xl font-medium">Global Parameters</h2>
              <div className="mt-6 space-y-4">
                <p>parameter 1</p>
                <p>parameter 2</p>
                <p>parameter 3</p>
                <p>parameter 4</p>
                <p>parameter 5</p>
              </div>
              <h2 className="mt-12 text-xl font-medium">Import/Export</h2>
              <div className="mt-6 space-y-4">
                <p>import</p>
                <p>export</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
