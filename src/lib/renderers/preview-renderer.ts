import type { IRenderer } from '@/components/webgpu-canvas';
import type { PreviewNode } from '@/lib/scene';
import type { WebGPUContext } from '@/lib/webgpu-context';

export class PreviewRenderer implements IRenderer {
  // ------------------------------------------------------------------------------------------
  // ------ Setup: buffers, layouts, pipeline
  // ------------------------------------------------------------------------------------------

  // TODO: various buffers, layouts, pipelines
  // Will probably need array/object of pipelines or abstracted preview node pipeline objects

  // @ts-expect-error TODO: use this context object elsewhere
  constructor(private webGPU: WebGPUContext) {
    // TODO: setup pipelines (might be nothing at the start)
  }

  // ------------------------------------------------------------------------------------------
  // ------ Required methods for IRenderer interface
  // ------------------------------------------------------------------------------------------

  onFrame() {
    // const { device } = this.webGPU;
    // TODO: run the pipeline(s)!
  }

  dispose() {
    // Destroy all allocated buffers
  }

  // ------------------------------------------------------------------------------------------
  // ------ Custom methods for PreviewRenderer
  // ------------------------------------------------------------------------------------------

  setPreviewNodes(previewNodes: Array<PreviewNode>) {
    // TODO: update necessary pipelines with new preview node logic
    console.log(previewNodes);
  }
}
