import { useEffect, useRef } from 'react';

import WebGPUCanvas from '@/components/webgpu-canvas';
import { NodeGraphRenderer } from '@/lib/renderers/node-graph-renderer';
import type { PreviewNode } from '@/lib/scene';

export type NodeGraphCanvasProps = {
  previewNodes: Array<PreviewNode>;
};

export default function NodeGraphCanvas({ previewNodes }: NodeGraphCanvasProps) {
  const rendererRef = useRef<NodeGraphRenderer | undefined>(undefined);

  // Update pipelines etc when preview nodes change
  useEffect(() => {
    rendererRef.current?.setPreviewNodes(previewNodes);
  }, [previewNodes]);

  return (
    <WebGPUCanvas
      createRenderer={(webGPU) => new NodeGraphRenderer(webGPU)}
      rendererRef={rendererRef}
      divClassName="absolute inset-0"
    />
  );
}
