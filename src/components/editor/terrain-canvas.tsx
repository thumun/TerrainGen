import { useEffect, useRef } from 'react';

import WebGPUCanvas, { type WebGPUCanvasProps } from '@/components/webgpu-canvas';
import {
  TerrainRenderer,
  type TerrainRendererGlobalParameters,
} from '@/lib/renderers/terrain-renderer';
import type { SceneGraph } from '@/lib/scene';

export type TerrainCanvasProps = {
  sceneGraph: SceneGraph;
  globalParams: TerrainRendererGlobalParameters;
};

const createRenderer: WebGPUCanvasProps['createRenderer'] = (webGPU, stage) =>
  new TerrainRenderer(webGPU, stage);

export default function TerrainCanvas({ sceneGraph, globalParams }: TerrainCanvasProps) {
  const rendererRef = useRef<TerrainRenderer | undefined>(undefined);

  // Update pipelines etc when scene graph changes
  useEffect(() => {
    rendererRef.current?.setSceneGraph(sceneGraph);
  }, [sceneGraph, rendererRef]);

  useEffect(() => {
    rendererRef.current?.setMeshUniforms(globalParams.size, globalParams.resolution);
  }, [globalParams.resolution, globalParams.size, rendererRef]);

  return (
    <WebGPUCanvas
      createRenderer={createRenderer}
      rendererRef={rendererRef}
      divClassName="absolute inset-0 bg-zinc-900"
    />
  );
}
