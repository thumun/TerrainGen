import { useEffect, useRef } from 'react';

import WebGPUCanvas, { type WebGPUCanvasProps } from '@/components/common/webgpu-canvas';
import {
  TerrainRenderer,
  type TerrainRendererGlobalParameters,
} from '@/lib/renderers/terrain-renderer';
import type * as scene from '@/lib/scene';

export type TerrainCanvasProps = {
  displacePipeline?: scene.DisplacePipeline;
  globalParams: TerrainRendererGlobalParameters;
};

const createRenderer: WebGPUCanvasProps['createRenderer'] = (webGPU, stage) =>
  new TerrainRenderer(webGPU, stage);

export default function TerrainCanvas({ displacePipeline, globalParams }: TerrainCanvasProps) {
  const rendererRef = useRef<TerrainRenderer | undefined>(undefined);

  // Update pipelines etc when scene graph changes
  useEffect(() => {
    if (displacePipeline === undefined) {
      rendererRef.current?.disableDisplacePipeline();
    } else {
      rendererRef.current?.configureDisplacePipeline(displacePipeline);
    }
  }, [displacePipeline]);

  // Update global parameters when sliders update them
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
