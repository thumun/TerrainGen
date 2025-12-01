import { useEffect } from 'react';

import WebGPUCanvas, { type WebGPUCanvasProps } from '@/components/common/webgpu-canvas';
import {
  TerrainRenderer,
  type TerrainRendererGlobalParameters,
} from '@/lib/renderers/terrain-renderer';
import type * as scene from '@/lib/scene';

export type TerrainCanvasProps = {
  rendererRef: React.RefObject<TerrainRenderer | undefined>;
  displacePipeline?: scene.DisplacePipeline;
  instancingPipeline?: scene.InstancingPipeline;
  globalParams: TerrainRendererGlobalParameters;
};

const createRenderer: WebGPUCanvasProps['createRenderer'] = async (webGPU, stage) => {
  const renderer = new TerrainRenderer(webGPU, stage);
  await renderer.init_mesh();
  return renderer;
};

export default function TerrainCanvas({
  rendererRef,
  displacePipeline,
  instancingPipeline,
  globalParams,
}: TerrainCanvasProps) {
  // Update pipelines etc when scene graph changes
  useEffect(() => {
    if (displacePipeline === undefined) {
      rendererRef.current?.disableDisplacePipeline();
    } else {
      rendererRef.current?.configureDisplacePipeline(displacePipeline);
    }
  }, [displacePipeline, rendererRef]);

  useEffect(() => {
    if (instancingPipeline === undefined) {
      rendererRef.current?.disableInstancingPipeline();
    } else {
      void rendererRef.current?.configureInstancingPipeline(instancingPipeline);
    }
  }, [instancingPipeline, rendererRef]);

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
