export type RootProps = {
  title: string;
  children?: React.ReactNode;
};

export default function Root({ title, children }: RootProps) {
  return (
    <div className="transform-node min-w-[280px] space-y-4 rounded-lg border border-slate-600 bg-slate-800 p-4 text-white shadow-md">
      {/* Node Title */}
      <div className="mb-2 text-center">
        <div className="inline-block -translate-y-1 transform rounded-md bg-linear-to-r from-blue-600 to-purple-600 px-4 py-2 font-bold text-white shadow-sm">
          {title}
        </div>
      </div>

      {children}
    </div>
  );
}
