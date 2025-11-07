import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

import type { WebGPUContext } from '@/lib/webgpu-context';
import { initWebGPU } from '@/lib/webgpu-context';

type PossiblyAwaitable<TArgs extends Array<unknown> = [], T = void> =
  | ((...args: TArgs) => T)
  | ((...args: TArgs) => Promise<T>);

export interface IRenderer {
  // TODO: could add a `onResize` method here
  /**
   * Called on each frame.
   */
  onFrame: (frameInfo: { time: number; deltaTime: number }) => void;
  /**
   * Used to cleanup all resources belonging to this renderer. The renderer will go out of
   * scope anyway, but we can manually deallocate things for performance purposes.
   *
   * Should be idempotent, i.e. multiple calls are OK.
   */
  dispose: () => void;
}

interface WebGPUCanvasProps {
  createRenderer: PossiblyAwaitable<[WebGPUContext], IRenderer>;
  /**
   * By taking rendererRef from a prop, we allow higher-level components to own and communicate
   * with the renderer object.
   */
  rendererRef: RefObject<IRenderer | undefined>;
}

export default function WebGPUCanvas({ createRenderer, rendererRef }: WebGPUCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  // initialize everything at component lifecycle start!
  useEffect(() => {
    let frameRequestId: number | undefined = undefined;
    let webGPUContext: WebGPUContext | undefined = undefined;

    const init = async () => {
      webGPUContext = await initWebGPU(canvasRef.current);
      rendererRef.current = await createRenderer(webGPUContext);

      let lastTime = Date.now();
      const doFrame = (time: number) => {
        if (!rendererRef.current) return;
        // TODO: probably add some kind of stats profiling stuff
        rendererRef.current.onFrame({ time, deltaTime: time - lastTime });
        lastTime = time;
        frameRequestId = window.requestAnimationFrame((t) => doFrame(t));
      };

      frameRequestId = window.requestAnimationFrame((t) => doFrame(t));
    };

    // run setup once, we don't await in sync context
    void init();

    // return cleanup method
    return () => {
      if (frameRequestId !== undefined) window.cancelAnimationFrame(frameRequestId);
      if (rendererRef.current) rendererRef.current.dispose();
      if (webGPUContext) webGPUContext.device.destroy();

      rendererRef.current = undefined;
    };
  }, [createRenderer, rendererRef]);

  return <canvas ref={canvasRef} className="fixed inset-0 bg-blue-100" />;
}
