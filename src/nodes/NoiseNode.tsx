import { useCallback, useState } from 'react';
import { Handle, Position } from 'reactflow';

function NoiseNode() {
  const [scale, setScale] = useState(0.5);
  const [density, setDensity] = useState(0.5);

  const onScaleChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(evt.target.value);
    setScale(newValue);
    console.log('Value 2:', newValue);
  }, []);

  const onDensityChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(evt.target.value);
    setDensity(newValue);
    console.log('Value 2:', newValue);
  }, []);

  return (
    <div className="transform-node bg-slate-800 text-white p-3 rounded-lg shadow-md min-w-[260px] space-y-3">
      
        <Handle
          type="source"
          position={Position.Right}
          id="vec3-out"
          className="!absolute !right-[-8px] !top-1/8 !-translate-y-1/2 !w-3 !h-3 !bg-green-500"
          data-handlecolor="green"
        />
      
      <div className="text-center mb-2">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 px-4 rounded-md shadow-sm inline-block transform -translate-y-1">
          Noise
        </div>
      </div>

      {/* Input Section */}
      <div className="relative flex items-center justify-between bg-slate-700/50 p-3 rounded-md">
        <Handle
          type="target"
          position={Position.Left}
          id="vec3-in"
          className="!absolute !left-[-8px] !top-1/2 !-translate-y-1/2 !w-3 !h-3 !bg-green-500"
          data-handlecolor="green"
        />
        <label className="text-sm font-medium flex-1">Input</label>
      </div>

      {/* Scale Section */}
      <div className="relative flex flex-col space-y-2 bg-slate-700/50 p-3 rounded-md">
        <Handle
          type="target"
          position={Position.Left}
          id="float-scale-in"
          className="!absolute !left-[-8px] !top-1/2 !-translate-y-1/2 !w-3 !h-3 !bg-blue-500"
          data-handlecolor="blue"
        />
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Scale</label>
          <span className="text-sm bg-slate-600 px-2 py-1 rounded min-w-[60px] text-center">
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
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Density Section */}
      <div className="relative flex flex-col space-y-2 bg-slate-700/50 p-3 rounded-md">
        <Handle
          type="target"
          position={Position.Left}
          id="float-density-in"
          className="!absolute !left-[-8px] !top-1/2 !-translate-y-1/2 !w-3 !h-3 !bg-blue-500"
          data-handlecolor="blue"
        />
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Density</label>
          <span className="text-sm bg-slate-600 px-2 py-1 rounded min-w-[60px] text-center">
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
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

    </div>
  );
}

export default NoiseNode;