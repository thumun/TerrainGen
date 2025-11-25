import * as Select from '@radix-ui/react-select';

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
    <div className="relative flex items-center rounded-md bg-zinc-600/50 py-1 pr-1 pl-3">
      <Select.Root value={value} onValueChange={(newValue) => onChange(newValue as TValue)}>
        <label className="grow text-sm">{label}</label>
        <Select.Trigger className="flex grow cursor-pointer justify-between rounded bg-transparent py-2 pr-2 pl-4 text-sm font-medium transition-colors hover:bg-zinc-600">
          <Select.Value placeholder="Select..." />
          <Select.Icon>▾</Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport className="rounded-lg border border-zinc-600 bg-zinc-900 p-1 text-white">
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="radix-highlighted:bg-linear-to-r radix-state-open:bg-zinc-800 radix-disabled:text-zinc-400 radix-disabled:grayscale radix-disabled:cursor-default cursor-pointer rounded-sm from-violet-600 to-indigo-600 px-3 py-1 focus-visible:outline-none"
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
