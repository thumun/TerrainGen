import { DraggableNumberInput } from 'draggable-number-input';

export type NumberInputProps = {
  value: number;
  valueType: 'f32' | 'u32';
  onChange: (value: number) => void;
  label?: string;
};

const VALUE_TYPE_INFO = {
  f32: {
    modifierKeys: {
      default: { multiplier: 1, sensitivity: 0.25 },
      shiftKey: { multiplier: 0.1, sensitivity: 0.25 },
      altKey: { multiplier: 10, sensitivity: 0.25 },
    },
  },
  u32: {
    modifierKeys: {
      default: { multiplier: 1, sensitivity: 0.25 },
      shiftKey: { multiplier: 1, sensitivity: 0.025 },
      altKey: { multiplier: 10, sensitivity: 0.25 },
    },
  },
};

export default function NumberInput({ value, valueType, onChange, label }: NumberInputProps) {
  const { modifierKeys } = VALUE_TYPE_INFO[valueType];

  return (
    <label className="relative flex items-center rounded-md py-1 pr-1 pl-3">
      {label && <span className="grow">{label}</span>}
      <DraggableNumberInput
        value={value}
        onChange={onChange}
        disablePointerLock
        modifierKeys={modifierKeys}
        className="nodrag w-32 rounded bg-zinc-600 py-2 pr-2 pl-4 font-medium tabular-nums transition-colors hover:bg-zinc-500/60 focus-visible:bg-zinc-500/60 focus-visible:outline-none"
      />
    </label>
  );
}
