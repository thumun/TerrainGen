import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';

import { useGPUDevice } from '@/hooks/use-gpu-device';
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
  divClassName?: string;
}

/**
 * Reusable component to set up a `canvas` component and its context for usage with WebGPU.
 * This is all bundled in `WebGPUContext` objects.
 *
 * Because `IRenderer` implementations depend on the device + context to be initialized, this
 * component also takes a `createRenderer` method, responsible for creating the `IRenderer`
 * using the `WebGPUContext`.
 */
export default function WebGPUCanvas({
  createRenderer,
  rendererRef,
  divClassName = 'relative',
}: WebGPUCanvasProps) {
  const { device } = useGPUDevice();
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  // initialize everything at component lifecycle start!
  useEffect(() => {
    if (!device) return;

    let frameRequestId: number | undefined = undefined;
    const webGPUContext = initWebGPU(device, canvasRef.current);

    const init = async () => {
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
  }, [createRenderer, device, rendererRef]);

  const resizeCanvas = useCallback(() => {
    canvasRef.current.width = divRef.current.clientWidth;
    canvasRef.current.height = divRef.current.clientHeight;

    // TODO: trigger `Renderer` resize event
  }, []);

  // setup resize callbacks
  const divRef = useRef<HTMLDivElement>(null!);
  useEffect(() => {
    // set canvas size once initially
    // for some reason we need this timeout or else layout isn't updated yet
    // also attempted `useLayoutEffect` but that didn't seem to work
    setTimeout(() => {
      resizeCanvas();
    });

    // attach resize observer
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(divRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, [resizeCanvas]);

  return (
    <div ref={divRef} className={divClassName}>
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
