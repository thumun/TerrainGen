import { useCallback, useState, useEffect } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

interface MathNodeData {
  operationVal: string;
}

function MathNodeVec3({ data }: NodeProps<MathNodeData>) {
  const operationVal = data.operationVal;
  const [operation, setOperation] = useState(operationVal);

  useEffect(() => {
    setOperation(operationVal);
  }, [operationVal]);

  const onOperationChange = useCallback((evt: React.ChangeEvent<HTMLSelectElement>) => {
    setOperation(evt.target.value);
  }, []);

  return (
    // need to change color & id based on type
    <div className="transform-node min-w-[280px] space-y-4 rounded-lg border border-slate-600 bg-slate-800 p-4 text-white shadow-md">
      <Handle
        type="source"
        position={Position.Right}
        id="vec3-out"
        className={`!absolute !top-1/8 !right-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-green-500`}
      />

      {/* Node Title */}
      <div className="mb-2 text-center">
        <div className="inline-block -translate-y-1 transform rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-bold text-white shadow-sm">
          Math (Vec3)
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
        </div>
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
        </div>
      </div>

      {/* Type of Node */}
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Mode</label>
          <div className="inline-flex -translate-y-1 transform items-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-green-600 px-4 py-2 font-bold text-white shadow-sm">
            <select
              value={operation}
              onChange={onOperationChange}
              className="bg-transparent font-bold focus:outline-none"
            >
              <option value="Add" className="bg-slate-800 text-white">
                Add
              </option>
              <option value="Sub" className="bg-slate-800 text-white">
                Subtract
              </option>
              <option value="Mult" className="bg-slate-800 text-white">
                Multiply
              </option>
              <option value="Div" className="bg-slate-800 text-white">
                Divide
              </option>
              <option value="Min" className="bg-slate-800 text-white">
                Min
              </option>
              <option value="Max" className="bg-slate-800 text-white">
                Max
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MathNodeVec3;
