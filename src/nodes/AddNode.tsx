import { useCallback, useState } from 'react';
import { Handle, Position } from 'reactflow';

function AddNode() {
  const [value1, setValue1] = useState(0.5);
  const [value2, setValue2] = useState(0.5);

  const onChange1 = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(evt.target.value);
    setValue1(newValue);
    console.log('Value 1:', newValue);
  }, []);

  const onChange2 = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(evt.target.value);
    setValue2(newValue);
    console.log('Value 2:', newValue);
  }, []);

  return (
    <div className="transform-node bg-slate-800 text-white p-4 rounded-lg shadow-md min-w-[280px] space-y-4 border border-slate-600">
      
      <Handle
        type="source"
        position={Position.Right}
        id="result-out"
        className="!absolute !right-[-8px] !top-1/8 !-translate-y-1/2 !w-3 !h-3 !bg-green-500"
      />

      {/* Node Title */}
      <div className="text-center mb-2">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 px-4 rounded-md shadow-sm inline-block transform -translate-y-1">
          Add
        </div>
      </div>
      
      {/* First Value Section */}
      <div className="relative flex flex-col space-y-2 bg-slate-700/50 p-3 rounded-md">
        <Handle
          type="target"
          position={Position.Left}
          id="value1-in"
          className="!absolute !left-[-8px] !top-1/2 !-translate-y-1/2 !w-3 !h-3 !bg-green-500"
        />
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Value A</label>
          <span className="text-sm bg-slate-600 px-2 py-1 rounded min-w-[60px] text-center">
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
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Second Value Section */}
      <div className="relative flex flex-col space-y-2 bg-slate-700/50 p-3 rounded-md">
        <Handle
          type="target"
          position={Position.Left}
          id="value2-in"
          className="!absolute !left-[-8px] !top-1/2 !-translate-y-1/2 !w-3 !h-3 !bg-green-500"
        />
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Value B</label>
          <span className="text-sm bg-slate-600 px-2 py-1 rounded min-w-[60px] text-center">
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
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Output Handle */}
      <div className="relative flex items-center justify-center bg-slate-700/50 p-3 rounded-md">

        <div className="text-center">
          <label className="text-sm font-medium block mb-1">Output</label>

        </div>
      </div>
    </div>
  );
}

export default AddNode;