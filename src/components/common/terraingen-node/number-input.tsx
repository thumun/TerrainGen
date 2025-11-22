export type NumberInputProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function NumberInput({ value, onChange }: NumberInputProps) {
  return (
    <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
      <div className="flex items-center justify-between">
        <input
          value={value}
          onChange={(evt) => onChange(Number.parseFloat(evt.target.value))}
          className="bg-transparent font-bold focus:outline-none"
        ></input>
      </div>
    </div>
  );
}
