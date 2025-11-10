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
    const controller = new AbortController();

    let device: GPUDevice | undefined;
    const init = async () => {
      const newDevice = await getWebGPUDevice();
      // Cancel state setting if we cleanup before promise resolves
      if (controller.signal.aborted) {
        newDevice?.destroy();
        return;
      }
      device = newDevice;

      setStore({ device });
    };

    void init();

    return () => {
      device?.destroy();
      // abort if we haven't resolved the init promise
      controller.abort();
    };
  }, []);

  return <GPUDeviceContext.Provider value={store}>{children}</GPUDeviceContext.Provider>;
}
