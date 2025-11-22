export type SelectInputProps<TValue extends string> = {
  value: TValue;
  onChange: (value: TValue) => void;
  options: { label: string; value: TValue }[];
  label: string;
};

export default function SelectInput<TValue extends string>({
  value,
  onChange,
  options,
  label,
}: SelectInputProps<TValue>) {
  return (
    <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <div className="inline-flex -translate-y-1 transform items-center gap-2 rounded-md bg-linear-to-r from-blue-600 to-green-600 px-4 py-2 font-bold text-white shadow-sm">
          <select
            value={value}
            onChange={(evt) => onChange(evt.target.value as TValue)}
            className="bg-transparent font-bold focus:outline-none"
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-slate-800 text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
