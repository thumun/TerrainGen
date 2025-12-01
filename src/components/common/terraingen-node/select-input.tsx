import * as Select from '@radix-ui/react-select';

import * as styles from '@/components/common/styles';

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
    <div className="relative flex items-center rounded-md py-1 pr-1 pl-3">
      <Select.Root value={value} onValueChange={(newValue) => onChange(newValue as TValue)}>
        <label className="grow">{label}</label>
        <Select.Trigger className="flex grow cursor-pointer justify-between rounded bg-zinc-600 py-2 pr-2 pl-4 font-medium transition-colors hover:bg-zinc-500/60">
          <Select.Value placeholder="Select..." />
          <Select.Icon className="mr-1 scale-125">▾</Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport className={styles.selectViewport}>
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className={styles.selectOption}
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
