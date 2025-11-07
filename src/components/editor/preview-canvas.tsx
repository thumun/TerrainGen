import { useEffect, useRef } from 'react';
import type { PreviewNode } from '@/lib/scene';
import WebGPUCanvas from '@/components/webgpu-canvas';
import { PreviewRenderer } from '@/lib/renderers/preview-renderer';

export type PreviewCanvasProps = {
  previewNodes: Array<PreviewNode>;
};

export function PreviewCanvas({ previewNodes }: PreviewCanvasProps) {
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
