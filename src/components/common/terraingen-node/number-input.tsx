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
    <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
      <div className="flex items-center justify-between">
        {label && <label className="mr-4 font-medium">{label}</label>}
        <input
          value={value}
          type="number"
          step={step}
          // TODO: better accessibility on this number, like dragging to raise/lower
          onChange={(evt) => onChange(Number.parseFloat(evt.target.value) || 0)}
          className="bg-transparent font-bold focus:outline-none"
        />
      </div>
    </div>
  );
}
