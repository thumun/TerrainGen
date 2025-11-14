import { useEffect, useRef } from 'react';
import React from 'react';

import WebGPUCanvas from '@/components/webgpu-canvas';
import { TerrainRenderer } from '@/lib/renderers/terrain-renderer';
import type { SceneGraph } from '@/lib/scene';

export type TerrainCanvasProps = {
  sceneGraph: SceneGraph;
};

export default function TerrainCanvas({ sceneGraph }: TerrainCanvasProps) {
  const rendererRef = useRef<TerrainRenderer | undefined>(undefined);

  // Update pipelines etc when scene graph changes
  useEffect(() => {
    rendererRef.current?.setSceneGraph(sceneGraph);
  }, [sceneGraph]);

  return (
    <WebGPUCanvas
      createRenderer={(webGPU, stage) => new TerrainRenderer(webGPU, stage)}
      rendererRef={rendererRef}
      divClassName="absolute inset-0 bg-zinc-900"
    />
  );
}

export const MemoizedTerrainCanvas = React.memo(
  TerrainCanvas,
  (prevProps: TerrainCanvasProps, nextProps: TerrainCanvasProps) =>
    prevProps.sceneGraph === nextProps.sceneGraph
);