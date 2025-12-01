import { DraggableNumberInput } from 'draggable-number-input';

export type NumberInputProps = {
  value: number;
  valueType: 'f32' | 'u32';
  onChange: (value: number) => void;
  label?: string;
  min?: number;
};

const VALUE_TYPE_INFO = {
  f32: {
    modifierKeys: {
      shiftKey: { multiplier: 0.01, sensitivity: 0.5 },
      default: { multiplier: 0.1, sensitivity: 0.5 },
      altKey: { multiplier: 1, sensitivity: 0.5 },
    },
  },
  u32: {
    modifierKeys: {
      shiftKey: { multiplier: 1, sensitivity: 0.005 },
      default: { multiplier: 1, sensitivity: 0.05 },
      altKey: { multiplier: 10, sensitivity: 0.05 },
    },
  },
};

export default function NumberInput({
  value,
  valueType,
  onChange,
  label = 'Value',
  min,
}: NumberInputProps) {
  const { modifierKeys } = VALUE_TYPE_INFO[valueType];

  return (
    <label className="relative flex items-center rounded-md py-1 pr-1 pl-3">
      <span className="grow">{label}</span>
      <DraggableNumberInput
        value={value}
        min={min}
        onChange={onChange}
        disablePointerLock
        modifierKeys={modifierKeys}
        className="nodrag w-32 rounded bg-zinc-600 py-2 pr-2 pl-4 font-medium tabular-nums transition-colors hover:bg-zinc-500/60 focus-visible:bg-zinc-500/60 focus-visible:outline-none"
      />
    </label>
  );
}
