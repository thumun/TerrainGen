import Editor from '@/components/editor';
import { GPUDeviceProvider } from '@/hooks/use-gpu-device';
import { MousePosProvider } from '@/hooks/use-mouse-pos';

export default function EditorPage() {
  return (
    <GPUDeviceProvider>
      <MousePosProvider>
        <Editor />
      </MousePosProvider>
    </GPUDeviceProvider>
  );
}
