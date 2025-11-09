import Editor from '@/components/editor';
import { GPUDeviceProvider } from '@/hooks/use-gpu-device';

export default function EditorPage() {
  return (
    <GPUDeviceProvider>
      <Editor />
    </GPUDeviceProvider>
  );
}
