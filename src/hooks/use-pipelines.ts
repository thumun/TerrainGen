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

  const setInstancingPipelines = useCallback(
    (pipelines: scene.InstancingPipeline[]) => {
      void terrainRendererRef.current?.configureInstancingPipeline(pipelines);
    },
    [terrainRendererRef],
  );

  const setUniform = useCallback(
    (key: string, value: number | [number, number, number]) => {
      console.log('setting uniform', key, 'to', value);
      terrainRendererRef.current?.setDisplacePipelineUniform(key, value);
    },
    [terrainRendererRef],
  );

  const rebuildPipelinesFromNode = useCallback(
    (nodeId: string, options: { nodes: graph.PipelineNode[]; edges: Edge[] }) => {
      const { displacePipeline, instancingPipeline } = graph.generatePipelinesFromNode(
        nodeId,
        options.nodes,
        options.edges,
      );

      if (displacePipeline) setDisplacePipeline(displacePipeline);
      if (instancingPipeline) void setInstancingPipelines(instancingPipeline);
    },
    [setDisplacePipeline, setInstancingPipelines],
  );

  const rebuildAllPipelines = useCallback(
    (options: { nodes: graph.PipelineNode[]; edges: Edge[] }) => {
      const { displacePipeline, instancingPipeline } = graph.generateAllPipelines(
        options.nodes,
        options.edges,
      );

      if (displacePipeline) setDisplacePipeline(displacePipeline);
      if (instancingPipeline) setInstancingPipelines(instancingPipeline);
    },
    [setDisplacePipeline, setInstancingPipelines],
  );

  return {
    setUniform,
    rebuildPipelinesFromNode,
    rebuildAllPipelines,
  };
}
