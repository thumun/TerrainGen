import { useCallback, useState } from 'react';
import { Handle, Position } from 'reactflow';

function NoiseNode() {
  const [scale, setScale] = useState(0.5);
  const [density, setDensity] = useState(0.5);

  const onScaleChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(evt.target.value);
    setScale(newValue);
  }, []);

  const onDensityChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(evt.target.value);
    setDensity(newValue);
  }, []);

  return (
    <div className="transform-node min-w-[260px] space-y-3 rounded-lg bg-slate-800 p-3 text-white shadow-md">
      <Handle
        type="source"
        position={Position.Right}
        id="vec3-out"
        className="!absolute !top-1/8 !right-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-green-500"
      />

      <div className="mb-2 text-center">
        <div className="inline-block -translate-y-1 transform rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-bold text-white shadow-sm">
          Noise
        </div>
      </div>

      {/* Input Section */}
      <div className="relative flex items-center justify-between rounded-md bg-slate-700/50 p-3">
        <Handle
          type="target"
          position={Position.Left}
          id="vec3-in"
          className="!absolute !top-1/2 !left-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-green-500"
        />
        <label className="flex-1 text-sm font-medium">Input</label>
      </div>

      {/* Scale Section */}
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <Handle
          type="target"
          position={Position.Left}
          id="float-scale-in"
          className="!absolute !top-1/2 !left-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-blue-500"
        />
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Scale</label>
          <span className="min-w-[60px] rounded bg-slate-600 px-2 py-1 text-center text-sm">
            {scale.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={scale}
          onChange={onScaleChange}
          className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-600"
        />
      </div>

      {/* Density Section */}
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <Handle
          type="target"
          position={Position.Left}
          id="float-density-in"
          className="!absolute !top-1/2 !left-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-blue-500"
        />
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Density</label>
          <span className="min-w-[60px] rounded bg-slate-600 px-2 py-1 text-center text-sm">
            {density.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={density}
          onChange={onDensityChange}
          className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-600"
        />
      </div>
    </div>
  );
}

export default NoiseNode;
