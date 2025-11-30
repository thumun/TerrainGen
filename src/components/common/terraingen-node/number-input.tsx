export type NumberInputProps = {
  value: number;
  valueType: 'f32' | 'u32';
  onChange: (value: number) => void;
  label?: string;
};

const VALUE_TYPE_INFO = {
  f32: { step: 0.1 },
  u32: { step: 1 },
};

export default function NumberInput({ value, valueType, onChange, label }: NumberInputProps) {
  const { step } = VALUE_TYPE_INFO[valueType];

  return (
    <div className="relative flex items-center rounded-md py-1 pr-1 pl-3">
      {label && <label className="grow">{label}</label>}
      <input
        value={value}
        type="number"
        step={step}
        // TODO: better accessibility on this number, like dragging to raise/lower
        onChange={(evt) => onChange(Number.parseFloat(evt.target.value) || 0)}
        className="w-24 rounded bg-zinc-600 py-2 pr-2 pl-4 font-medium transition-colors hover:bg-zinc-500/60 focus-visible:bg-zinc-500/60 focus-visible:outline-none"
      />
    </div>
  );
}
