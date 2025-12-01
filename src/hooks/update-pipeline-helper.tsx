import { createContext, useContext } from 'react';

import { TerrainRenderer } from '@/lib/renderers/terrain-renderer';

const TerrainRendererContext = createContext<TerrainRenderer | undefined>(undefined);

export const TerrainRendererProvider = TerrainRendererContext.Provider;

export function useTerrainRenderer() {
  return useContext(TerrainRendererContext);
}

export function updatePipeline(
  renderer: TerrainRenderer | undefined,
  handleId: string,
  data: number | [number, number, number],
) {
  console.log('updatePipeline called with:', { renderer, handleId, data });
  renderer?.setDisplacePipelineUniform(handleId, data);
}
