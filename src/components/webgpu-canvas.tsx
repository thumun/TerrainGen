import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';

import { useGPUDevice } from '@/hooks/use-gpu-device';
import { Camera } from '@/lib/scene/camera';
import { Stage } from '@/lib/scene/stage';
import { Plane } from '@/lib/scene/mesh';
import type { WebGPUContext } from '@/lib/webgpu-context';
import { initWebGPU } from '@/lib/webgpu-context';

type PossiblyAwaitable<TArgs extends Array<unknown> = [], T = void> =
  | ((...args: TArgs) => T)
  | ((...args: TArgs) => Promise<T>);

export interface IRenderer {
  /**
   * Called initially, and on each resize.
   */
  onResize: (pixelDimensions: { width: number; height: number }) => void;
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
  createRenderer: PossiblyAwaitable<[WebGPUContext, Stage], IRenderer>;
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

  const resizeCanvas = useCallback(
    (clientDimensions: { width: number; height: number }) => {
      const { width, height } = clientDimensions;
      const [pixelWidth, pixelHeight] = [
        Math.floor(width * window.devicePixelRatio),
        Math.floor(height * window.devicePixelRatio),
      ];

      const [roundedWidth, roundedHeight] = [
        pixelWidth / window.devicePixelRatio,
        pixelHeight / window.devicePixelRatio,
      ];

      canvasRef.current.width = pixelWidth;
      canvasRef.current.height = pixelHeight;
      canvasRef.current.style.width = `${roundedWidth}px`;
      canvasRef.current.style.height = `${roundedHeight}px`;

      rendererRef.current?.onResize({
        width: pixelWidth,
        height: pixelHeight,
      });
    },
    [rendererRef],
  );

  // setup resize callbacks
  const divRef = useRef<HTMLDivElement>(null!);
  useEffect(() => {
    // attach resize observer
    const resizeObserver = new ResizeObserver(([entry]) => {
      resizeCanvas(entry.contentRect);
    });
    resizeObserver.observe(divRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, [resizeCanvas]);

  // initialize everything at component lifecycle start!
  useEffect(() => {
    if (!device) return;

    let frameRequestId: number | undefined = undefined;
    const webGPUContext = initWebGPU(device, canvasRef.current);

    // setup scene
    const camera = new Camera(webGPUContext);
    const mesh = new Plane(10, 100);
    const stage = new Stage(camera, mesh);

    // TODO: Generate shader code from nodes here

    const controller = new AbortController();
    const init = async () => {
      const newRenderer = await createRenderer(webGPUContext, stage);
      if (controller.signal.aborted) {
        newRenderer.dispose();
        return;
      }
      rendererRef.current = newRenderer;

      resizeCanvas({
        width: divRef.current.clientWidth,
        height: divRef.current.clientHeight,
      });

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
      rendererRef.current?.dispose();
      webGPUContext.device?.destroy();
      rendererRef.current = undefined;
      // abort if we haven't resolved the init promise
      controller.abort();
    };
  }, [createRenderer, device, rendererRef, resizeCanvas]);

  return (
    <div ref={divRef} className={divClassName}>
      <canvas ref={canvasRef} className="absolute" />
    </div>
  );
}
