import { Handle, Position } from 'reactflow';

function SeparateNode() {
  return (
    <div className="transform-node min-w-[280px] space-y-4 rounded-lg border border-slate-600 bg-slate-800 p-4 text-white shadow-md">
      <Handle
        type="target"
        position={Position.Left}
        id="vec3-val1-in"
        className="!absolute !top-1/2 !left-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-green-500"
      />
      {/* Node Title */}
      <div className="mb-2 text-center">
        <div className="inline-block -translate-y-1 transform rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-bold text-white shadow-sm">
          Separate-XYZ
        </div>
      </div>

      {/* Translate Section */}
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <Handle
          type="source"
          position={Position.Right}
          id="float-x-out"
          className="!absolute !top-1/12 !right-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-blue-500"
        />
        <div className="flex justify-center space-x-2">
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">X</span>
          </div>
        </div>
      </div>
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <Handle
          type="source"
          position={Position.Right}
          id="float-y-out"
          className="!absolute !top-1/12 !right-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-blue-500"
        />
        <div className="flex justify-center space-x-2">
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Y</span>
          </div>
        </div>
      </div>
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <Handle
          type="source"
          position={Position.Right}
          id="float-z-out"
          className="!absolute !top-1/12 !right-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-blue-500"
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

export default SeparateNode;
