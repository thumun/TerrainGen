import { useState } from 'react';

import MainCanvas from './main-canvas';
import PreviewCanvas from './preview-canvas';

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
    <div className="w-full max-w-[2400px] mx-auto grid grid-rows-[auto_1fr] h-screen max-h-[1800px]">
      <header className="bg-zinc-700 py-4 px-8">
        <h1 className="text-2xl font-bold tracking-tight">TerrainGen</h1>
      </header>
      <main className="grid grid-cols-[3fr_minmax(560px,2fr)] grow bg-zinc-800">
        {/* Left column */}
        <div className="flex flex-col">
          <div className="text-zinc-400 py-2 px-4 border-b-2 border-zinc-900 bg-zinc-900">
            Toolbar or something goes here
          </div>
          <div className="relative grow">
            <PreviewCanvas previewNodes={previewNodes} />
            {/* TODO: Overlay the node editor here... */}
          </div>
        </div>

        {/* Right column */}
        <div className="relative flex flex-col overflow-clip border-l-2 border-zinc-900">
          <div className="relative aspect-4/3">
            <MainCanvas sceneGraph={sceneGraph} />
          </div>
          <div className="grow relative">
            <div className="absolute inset-0 py-4 px-8 overflow-y-auto">
              <h2 className="text-xl font-medium">Global Parameters</h2>
              <div className="space-y-4 mt-6">
                <p>parameter 1</p>
                <p>parameter 2</p>
                <p>parameter 3</p>
                <p>parameter 4</p>
                <p>parameter 5</p>
              </div>
              <h2 className="mt-12 text-xl font-medium">Import/Export</h2>
              <div className="space-y-4 mt-6">
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
