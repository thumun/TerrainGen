import type { WebGPUContext } from '@/lib/webgpu-context';

export class DirectionalLight {
  // @ts-expect-error TODO: eventually we will read this!
  private readonly shadowDepthTextureView: GPUTextureView;

  static readonly nearPlane = 1.0;
  static readonly farPlane = 200;

  public constructor(
    webGPU: WebGPUContext,
    { depthTextureSize = 2048 }: { depthTextureSize?: number } = {},
  ) {
    const { device } = webGPU;

    // Initialize buffers for shadow casting

    const shadowDepthTexture = device.createTexture({
      size: [depthTextureSize, depthTextureSize, 1],
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      format: 'depth32float',
    });
    this.shadowDepthTextureView = shadowDepthTexture.createView();
  }

  // TODO: implement this based on existing render logic
  // public doShadowMapping({ meshes }: { meshes: Mesh[] }) {
  //   meshes.forEach((mesh) => {
  //
  //   });
  // }
}
