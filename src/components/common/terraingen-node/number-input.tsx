export type NumberInputProps = {
  value: number;
  onChange: (value: number) => void;
  label?: string;
};

export default function NumberInput({ value, onChange, label }: NumberInputProps) {
  return (
    <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
      <div className="flex items-center justify-between">
        {label && <label className="mr-4 font-medium">{label}</label>}
        <input
          value={value}
          type="number"
          step={0.1}
          // TODO: better accessibility on this number, like dragging to raise/lower
          onChange={(evt) => onChange(Number.parseFloat(evt.target.value) || 0)}
          className="bg-transparent font-bold focus:outline-none"
        />
      </div>
    </div>
  );
}
