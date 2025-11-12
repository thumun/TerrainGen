import { useCallback, useState } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

interface MathNodeData {
  isOutput?: boolean;
}

function MathNode({ data }: NodeProps<MathNodeData>) {
  const [value1, setValue1] = useState(0.5);
  const [value2, setValue2] = useState(0.5);
  const [value3, setValue3] = useState(0.5);

  const onChange1 = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(evt.target.value);
    setValue1(newValue);
  }, []);

  const onChange2 = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(evt.target.value);
    setValue2(newValue);
  }, []);

  const onChange3 = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(evt.target.value);
    setValue3(newValue);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isOutput = data?.isOutput || false;

  return (
    <div className="transform-node min-w-[280px] space-y-4 rounded-lg border border-slate-600 bg-slate-800 p-4 text-white shadow-md">
      <Handle
        type="source"
        position={Position.Right}
        id="vec3-out"
        className="!absolute !top-1/8 !right-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-green-500"
      />

      {/* Node Title */}
      <div className="mb-2 text-center">
        <div className="inline-block -translate-y-1 transform rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-bold text-white shadow-sm">
          Mix
        </div>
      </div>

      {/* First Value Section */}
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <Handle
          type="target"
          position={Position.Left}
          id="vec3-val1-in"
          className="!absolute !top-1/2 !left-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-green-500"
        />
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Value A</label>
          <span className="min-w-[60px] rounded bg-slate-600 px-2 py-1 text-center text-sm">
            {value1.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={value1}
          onChange={onChange1}
          className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-600"
        />
      </div>

      {/* Second Value Section */}
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <Handle
          type="target"
          position={Position.Left}
          id="vec3-val2-in"
          className="!absolute !top-1/2 !left-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-green-500"
        />
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Value B</label>
          <span className="min-w-[60px] rounded bg-slate-600 px-2 py-1 text-center text-sm">
            {value2.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={value2}
          onChange={onChange2}
          className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-600"
        />
      </div>
      {/* Third Value Section */}
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <Handle
          type="target"
          position={Position.Left}
          id="vec3-val2-in"
          className="!absolute !top-1/2 !left-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-blue-500"
        />
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Mix Value</label>
          <span className="min-w-[60px] rounded bg-slate-600 px-2 py-1 text-center text-sm">
            {value3.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={value3}
          onChange={onChange3}
          className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-600"
        />
      </div>
    </div>
  );
}

export default MathNode;
