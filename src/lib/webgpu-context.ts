export type WebGPUContext = {
  canvas: HTMLCanvasElement;
  canvasFormat: GPUTextureFormat;
  context: GPUCanvasContext;
  device: GPUDevice;
  getCanvasTextureView: () => GPUTextureView;

  aspectRatio: number;
};

export async function initWebGPU(canvas: HTMLCanvasElement): Promise<WebGPUContext> {
  const devicePixelRatio = window.devicePixelRatio;
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;

  const aspectRatio = canvas.width / canvas.height;

  // Our type system thinks this will always be defined, but browsers without webGPU supported
  // won't have this field defined
  //
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!navigator.gpu) {
    const errorMessageElement = document.createElement('h1');
    errorMessageElement.textContent =
      "This browser doesn't support WebGPU! Try using Google Chrome.";
    errorMessageElement.style.paddingLeft = '0.4em';
    document.body.innerHTML = '';
    document.body.appendChild(errorMessageElement);
    throw new Error('WebGPU not supported on this browser');
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('no appropriate GPUAdapter found');
  }

  const device = await adapter.requestDevice();

  const context = canvas.getContext('webgpu')!;
  const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device: device,
    format: canvasFormat,
  });

  console.log('WebGPU init successsful');

  const getCanvasTextureView = () => context.getCurrentTexture().createView();

  return {
    canvas,
    canvasFormat,
    context,
    device,
    getCanvasTextureView,
    aspectRatio,
  } satisfies WebGPUContext;
}
