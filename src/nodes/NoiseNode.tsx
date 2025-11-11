import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';

function NoiseNode() {
  const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    console.log(evt.target.value);
  }, []);

  return (
    <div className="transform-node bg-slate-800 text-white p-3 rounded-lg shadow-md min-w-[260px] space-y-3">
      <div className="text-center mb-2">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 px-4 rounded-md shadow-sm inline-block transform -translate-y-1">
          Noise
        </div>
      </div>

      <div className="relative flex items-center justify-between">
        <Handle
          type="target"
          position={Position.Right}
          id="translate-in"
          className="!absolute !right-[-10px] !top-1/2 !-translate-y-1/2"
        />
        <label className="w-20 text-sm font-medium">Noise</label>
        <div className="flex space-x-1">
          <input className="w-12 bg-slate-700 text-white text-center rounded p-1" name="tx" onChange={onChange} />
          <input className="w-12 bg-slate-700 text-white text-center rounded p-1" name="ty" onChange={onChange} />
          <input className="w-12 bg-slate-700 text-white text-center rounded p-1" name="tz" onChange={onChange} />
        </div>
      </div>
    </div>
  );
}

export default NoiseNode;