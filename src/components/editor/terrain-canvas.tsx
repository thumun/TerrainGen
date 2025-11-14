import { useEffect, memo } from 'react';

import WebGPUCanvas from '@/components/webgpu-canvas';
import { TerrainRenderer } from '@/lib/renderers/terrain-renderer';
import type { SceneGraph } from '@/lib/scene';

export type TerrainCanvasProps = {
  sceneGraph: SceneGraph;
  rendererRef: React.RefObject<TerrainRenderer | undefined>;
};

export default function TerrainCanvas({ sceneGraph, rendererRef }: TerrainCanvasProps) {
  // Update pipelines etc when scene graph changes
  useEffect(() => {
    rendererRef.current?.setSceneGraph(sceneGraph);
  }, [sceneGraph, rendererRef]);

  return (
    <WebGPUCanvas
      createRenderer={(webGPU, stage) => {
        const renderer = new TerrainRenderer(webGPU, stage);
        rendererRef.current = renderer;
        return renderer;
      }}
      rendererRef={rendererRef}
      divClassName="absolute inset-0 bg-zinc-900"
    />
  );
}

export const MemoizedTerrainCanvas = memo(
  TerrainCanvas,
  (prevProps: TerrainCanvasProps, nextProps: TerrainCanvasProps) =>
    prevProps.sceneGraph === nextProps.sceneGraph,
);
