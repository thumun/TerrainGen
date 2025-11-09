import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { getWebGPUDevice } from '@/lib/webgpu-context';

type GPUDeviceContextState = { device: GPUDevice | undefined };

const GPUDeviceContext = createContext<GPUDeviceContextState>({ device: undefined });

export function useGPUDevice() {
  return useContext(GPUDeviceContext);
}

export function GPUDeviceProvider({ children }: PropsWithChildren) {
  const [store, setStore] = useState<GPUDeviceContextState>({ device: undefined });

  // Fetch ye olde GPU device
  useEffect(() => {
    if (store.device) return;

    const controller = new AbortController();
    let device: GPUDevice | undefined = undefined;
    const init = async () => {
      device = await getWebGPUDevice();
      // Cancel state setting if we cleanup before promise resolves
      if (controller.signal.aborted) {
        return;
      }

      setStore({ device });
    };

    void init();

    return () => {
      controller.abort();
      device?.destroy();
    };
  }, [store.device]);

  return <GPUDeviceContext.Provider value={store}>{children}</GPUDeviceContext.Provider>;
}
