import { useEffect, useRef } from 'react';

import WebGPUCanvas from '@/components/webgpu-canvas';
import { PreviewRenderer } from '@/lib/renderers/preview-renderer';
import type { PreviewNode } from '@/lib/scene';

export type PreviewCanvasProps = {
  previewNodes: Array<PreviewNode>;
};

export default function PreviewCanvas({ previewNodes }: PreviewCanvasProps) {
  const rendererRef = useRef<PreviewRenderer | undefined>(undefined);

  // Update pipelines etc when preview nodes change
  useEffect(() => {
    rendererRef.current?.setPreviewNodes(previewNodes);
  }, [previewNodes]);

  return (
    <WebGPUCanvas
      createRenderer={(webGPU) => new PreviewRenderer(webGPU)}
      rendererRef={rendererRef}
    />
  );
}
