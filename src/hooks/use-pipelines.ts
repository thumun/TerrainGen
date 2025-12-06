import { useCallback, type RefObject } from 'react';
import type { Edge } from 'reactflow';

import * as graph from '@/lib/graph';
import type { TerrainRenderer } from '@/lib/renderers/terrain-renderer';
import type * as scene from '@/lib/scene';

export type UsePipelinesOptions = {
  terrainRendererRef: RefObject<TerrainRenderer | undefined>;
};

export type UsePipelinesResult = ReturnType<typeof usePipelines>;

export function usePipelines({ terrainRendererRef }: UsePipelinesOptions) {
  const setDisplacePipeline = useCallback(
    (pipeline: scene.DisplacePipeline) => {
      terrainRendererRef.current?.configureDisplacePipeline(pipeline);
    },
    [terrainRendererRef],
  );

  const setWaterPipeline = useCallback(
    (pipeline: scene.WaterPipeline) => {
      terrainRendererRef.current?.configureWaterPipeline(pipeline);
    },
    [terrainRendererRef],
  );

  const setInstancingPipeline = useCallback(
    (pipeline: scene.InstancingPipeline) => {
      void terrainRendererRef.current?.configureInstancingPipeline(pipeline);
    },
    [terrainRendererRef],
  );

  const setUniform = useCallback(
    (key: string, value: number | [number, number, number]) => {
      console.log('setting uniform', key, 'to', value);
      // Try terrain pipeline first
      terrainRendererRef.current?.setDisplacePipelineUniform(key, value);
      // Also try water pipeline (it will log a warning if not found, which is fine)
      terrainRendererRef.current?.setWaterPipelineUniform(key, value);
    },
    [terrainRendererRef],
  );

  const rebuildPipelinesFromNode = useCallback(
    (nodeId: string, options: { nodes: graph.PipelineNode[]; edges: Edge[] }) => {
      const { displacePipeline, waterPipeline, instancingPipeline } = graph.generatePipelinesFromNode(
        nodeId,
        options.nodes,
        options.edges,
      );

      if (displacePipeline) setDisplacePipeline(displacePipeline);
      if (waterPipeline) setWaterPipeline(waterPipeline);
      if (instancingPipeline) void setInstancingPipeline(instancingPipeline);
    },
    [setDisplacePipeline, setWaterPipeline, setInstancingPipeline],
  );

  const rebuildAllPipelines = useCallback(
    (options: { nodes: graph.PipelineNode[]; edges: Edge[] }) => {
      const { displacePipeline, waterPipeline, instancingPipeline } = graph.generateAllPipelines(
        options.nodes,
        options.edges,
      );

      if (displacePipeline) setDisplacePipeline(displacePipeline);
      if (waterPipeline) setWaterPipeline(waterPipeline);
      if (instancingPipeline) void setInstancingPipeline(instancingPipeline);
    },
    [setDisplacePipeline, setWaterPipeline, setInstancingPipeline],
  );

  return {
    setUniform,
    rebuildPipelinesFromNode,
    rebuildAllPipelines,
  };
}
