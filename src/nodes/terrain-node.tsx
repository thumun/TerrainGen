import { useCallback, useState } from 'react';
import { Handle, Position } from 'reactflow';

function TerrainNode() {
  const [translate, setTranslate] = useState({ x: 0, y: 0, z: 0 });

  const onTranslateChange = useCallback((axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = parseFloat(value) || 0;

    setTranslate((prev) => ({ ...prev, [axis]: numValue }));
  }, []);

  return (
    <div className="transform-node min-w-[260px] space-y-3 rounded-lg bg-slate-800 p-3 text-white shadow-md">
      <div className="mb-2 text-center">
        <div className="inline-block -translate-y-1 transform rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-bold text-white shadow-sm">
          Terrain
        </div>
      </div>

      {/* Translate Section */}
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <Handle
          type="target"
          position={Position.Left}
          id="vec3-trans-in"
          className="!absolute !top-1/2 !left-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-green-500"
        />
        <label className="text-sm font-medium">Height Map</label>
        <div className="flex justify-center space-x-2">
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">X</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={translate.x}
              onChange={(e) => onTranslateChange('x', e.target.value)}
              type="number"
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Y</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={translate.y}
              onChange={(e) => onTranslateChange('y', e.target.value)}
              type="number"
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Z</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={translate.z}
              onChange={(e) => onTranslateChange('z', e.target.value)}
              type="number"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TerrainNode;
