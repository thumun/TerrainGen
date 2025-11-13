import { useEffect, useRef } from 'react';

import WebGPUCanvas from '@/components/webgpu-canvas';
import { TerrainRenderer } from '@/lib/renderers/terrain-renderer';
import type { DisplacePipeline } from '@/lib/scene';

export type TerrainCanvasProps = {
  displacePipeline?: DisplacePipeline;
};

export default function TerrainCanvas({ displacePipeline }: TerrainCanvasProps) {
  const rendererRef = useRef<TerrainRenderer | undefined>(undefined);

  // Update pipelines etc when scene graph changes
  useEffect(() => {
    if (displacePipeline === undefined) {
      rendererRef.current?.disableDisplacePipeline();
    } else {
      rendererRef.current?.configureDisplacePipeline(displacePipeline);
    }
  }, [displacePipeline]);

  return (
    <WebGPUCanvas
      createRenderer={(webGPU, stage) => new TerrainRenderer(webGPU, stage)}
      rendererRef={rendererRef}
      divClassName="absolute inset-0 bg-zinc-900"
    />
  );
}
