/** An option in a select menu, highlighted violet/indigo when selected */
export const selectOption =
  'flex items-center gap-x-2 radix-highlighted:bg-linear-to-r radix-state-open:bg-zinc-800 radix-disabled:text-zinc-400 radix-disabled:grayscale radix-disabled:cursor-default cursor-pointer rounded-sm from-violet-600 to-indigo-600 px-3 py-1 focus-visible:outline-none';

/** A sub-menu trigger, similar to `selectOption` but highlighted gray when open */
export const subMenuTrigger =
  'radix-highlighted:bg-zinc-800 radix-disabled:text-zinc-400 radix-state-open:bg-zinc-800 radix-disabled:grayscale flex cursor-default justify-between gap-x-4 rounded-sm py-1 pr-2 pl-3 focus-visible:outline-none';

/** Select menu parent element, for use with `selectOption` and `subMenuTrigger` */
export const selectViewport = 'rounded-lg border border-zinc-600 bg-zinc-900 p-1 text-white';
