import { Handle, Position } from 'reactflow';

function CombineNode() {
  return (
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
          Combine-XYZ
        </div>
      </div>

      {/* Inputs Section */}
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <Handle
          type="target"
          position={Position.Left}
          id="float-x-in"
          className="!absolute !top-1/12 !left-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-blue-500"
        />
        <div className="flex justify-center space-x-2">
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">X</span>
          </div>
        </div>
      </div>
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <Handle
          type="target"
          position={Position.Left}
          id="float-y-in"
          className="!absolute !top-1/12 !left-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-blue-500"
        />
        <div className="flex justify-center space-x-2">
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Y</span>
          </div>
        </div>
      </div>
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <Handle
          type="target"
          position={Position.Left}
          id="float-z-in"
          className="!absolute !top-1/12 !left-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-blue-500"
        />
        <div className="flex justify-center space-x-2">
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Z</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CombineNode;
