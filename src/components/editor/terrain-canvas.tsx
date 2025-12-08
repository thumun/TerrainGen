import path from 'path-browserify';
import { useEffect } from 'react';

import type { GlobalParams } from './terrain-sliders';

import WebGPUCanvas, { type WebGPUCanvasProps } from '@/components/common/webgpu-canvas';
import { TerrainRenderer } from '@/lib/renderers/terrain-renderer';

export type TerrainCanvasProps = {
  rendererRef: React.RefObject<TerrainRenderer | undefined>;
  globalParams: GlobalParams;
};

const createRenderer: WebGPUCanvasProps['createRenderer'] = async (webGPU, stage) => {
  const renderer = new TerrainRenderer(webGPU, stage);
  await renderer.load_skybox(path.join(import.meta.env.BASE_URL, '/skyboxes/sky.hdr'));
  return renderer;
};

export default function TerrainCanvas({ rendererRef, globalParams }: TerrainCanvasProps) {
  // Update global parameters when sliders update them
  useEffect(() => {
    rendererRef.current?.setMeshUniforms(globalParams.size, globalParams.resolution);
  }, [globalParams.resolution, globalParams.size, rendererRef]);

  useEffect(() => {
    rendererRef.current?.setCameraUniforms({
      fogColor: globalParams.fog.color,
      fogIntensity: globalParams.fog.intensity,
    });
  }, [globalParams.fog.color, globalParams.fog.intensity, rendererRef]);

  return (
    <WebGPUCanvas
      createRenderer={createRenderer}
      rendererRef={rendererRef}
      divClassName="absolute inset-0 bg-zinc-900"
    />
  );
}
