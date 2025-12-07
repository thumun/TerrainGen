import { useEffect } from 'react';

import WebGPUCanvas, { type WebGPUCanvasProps } from '@/components/common/webgpu-canvas';
import {
  TerrainRenderer,
  type TerrainRendererGlobalParameters,
} from '@/lib/renderers/terrain-renderer';

export type TerrainCanvasProps = {
  rendererRef: React.RefObject<TerrainRenderer | undefined>;
  globalParams: TerrainRendererGlobalParameters;
};

const createRenderer: WebGPUCanvasProps['createRenderer'] = async (webGPU, stage) => {
  const renderer = new TerrainRenderer(webGPU, stage);
  await renderer.load_skybox('/skyboxes/sky.hdr');
  return renderer;
};

export default function TerrainCanvas({ rendererRef, globalParams }: TerrainCanvasProps) {
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
