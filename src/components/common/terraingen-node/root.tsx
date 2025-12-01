import { clsx } from 'clsx';

export type RootProps = {
  title: string;
  selected?: boolean;
  dragging?: boolean;
  children?: React.ReactNode;
};

export default function Root({ title, selected, dragging, children }: RootProps) {
  return (
    <div
      className={clsx(
        'transform-node min-w-[280px] rounded-lg text-white transition-[box-shadow,background-color]',
        {
          'shadow-sm ring ring-zinc-500': !selected && !dragging,
          'shadow-md ring-2 ring-zinc-400': selected && !dragging,
          'shadow-md ring ring-zinc-500': dragging,
        },
      )}
    >
      {/* Node Title */}
      <div
        className={clsx(
          'rounded-t-lg bg-linear-to-r px-4 py-3 font-medium backdrop-blur-lg transition-[--tw-gradient-from,--tw-gradient-to]',
          {
            'from-zinc-600 to-zinc-600': !selected && !dragging,
            'from-indigo-600 to-violet-600': selected && !dragging,
            'from-indigo-600/80 to-violet-600/80': dragging,
          },
        )}
      >
        {title}
      </div>

      {/* Node Body */}
      <div
        className={clsx('space-y-2 rounded-b-lg px-4 py-3 backdrop-blur-lg transition-colors', {
          'bg-zinc-700': !dragging,
          'bg-zinc-700/70': dragging,
        })}
      >
        {children}
      </div>
    </div>
  );
}
