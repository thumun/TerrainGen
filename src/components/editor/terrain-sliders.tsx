export type TerrainSliderProps = {
  globalParams: {
    size: number;
    resolution: number;
  };
  setGlobalParams: React.Dispatch<
    React.SetStateAction<{
      size: number;
      resolution: number;
    }>
  >;
};

export default function TerrainSliders({ globalParams, setGlobalParams }: TerrainSliderProps) {
  return (
    <div className="mt-6 space-y-10 text-zinc-300">
      <div className="space-y-2">
        <label className="text-sm font-medium">Terrain Size</label>
        <input
          type="range"
          min={1}
          max={100}
          step={1}
          value={globalParams.size}
          onChange={(e) => {
            const v = Number(e.target.value);
            setGlobalParams((prev) => ({
              ...prev,
              size: v,
            }));
          }}
          className="w-full"
        />
        <div className="text-xs opacity-75">{globalParams.size.toFixed(0)}</div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Terrain Resolution</label>
        <input
          type="range"
          min={1}
          max={100}
          step={1}
          value={globalParams.resolution}
          onChange={(e) => {
            const v = Number(e.target.value);
            setGlobalParams((prev) => ({
              ...prev,
              resolution: v,
            }));
          }}
          className="w-full"
        />
        <div className="text-xs opacity-75">{globalParams.resolution}</div>
      </div>
    </div>
  );
}
