import { useEffect, useRef } from 'react';

import WebGPUCanvas from '@/components/webgpu-canvas';
import { MainRenderer } from '@/lib/renderers/main-renderer';
import type { SceneGraph } from '@/lib/scene';

export type MainCanvasProps = {
  sceneGraph: SceneGraph;
};

export default function MainCanvas({ sceneGraph }: MainCanvasProps) {
  const rendererRef = useRef<MainRenderer | undefined>(undefined);

  // Update pipelines etc when scene graph changes
  useEffect(() => {
    rendererRef.current?.setSceneGraph(sceneGraph);
  }, [sceneGraph]);

  return (
    <WebGPUCanvas
      createRenderer={(webGPU) => new MainRenderer(webGPU)}
      rendererRef={rendererRef}
    />
  );
}
