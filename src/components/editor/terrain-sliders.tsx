export type GlobalParams = {
  size: number;
  resolution: number;
  fog: { intensity: number; color: [number, number, number] };
};

export type TerrainSliderProps = {
  globalParams: GlobalParams;
  setGlobalParams: React.Dispatch<React.SetStateAction<GlobalParams>>;
};

export default function TerrainSliders({ globalParams, setGlobalParams }: TerrainSliderProps) {
  const fogColorChannelHexes = globalParams.fog.color.map((v) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, '0'),
  );

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

      <label className="block space-y-2 text-sm font-medium">
        <span className="block text-sm font-medium">Fog Color</span>
        <input
          type="color"
          value={`#${fogColorChannelHexes[0]}${fogColorChannelHexes[1]}${fogColorChannelHexes[2]}`}
          onChange={(evt) => {
            const { value } = evt.target;
            if (value.startsWith('#')) {
              console.log(value);
              const color: [number, number, number] = [
                parseInt(value.slice(1, 3), 16) / 255,
                parseInt(value.slice(3, 5), 16) / 255,
                parseInt(value.slice(5, 7), 16) / 255,
              ];
              setGlobalParams((prev) => ({
                ...prev,
                fog: { ...prev.fog, color },
              }));
            } else {
              console.warn('uh oh we dont have logic for this onChange result');
            }
          }}
        />
      </label>

      <div className="space-y-2">
        <label className="text-sm font-medium">Fog Intensity</label>
        <input
          type="range"
          min={0.0}
          max={2.5}
          step={0.01}
          value={globalParams.fog.intensity}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setGlobalParams((prev) => ({
              ...prev,
              fog: { ...prev.fog, intensity: v },
            }));
          }}
          className="w-full"
        />
        <div className="text-xs opacity-75">{globalParams.fog.intensity}</div>
      </div>
    </div>
  );
}
