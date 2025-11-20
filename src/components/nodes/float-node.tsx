import { useCallback } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

import { useNodeData } from '@/hooks/use-node-data';

interface MathNodeData {
  operationVal: number;
}

function FloatNode({ id, data }: NodeProps<MathNodeData>) {
  const { setNodeData } = useNodeData();

  const onOperationChange = useCallback(
    (value: string) => {
      const numValue = parseFloat(value) || 0;

      setNodeData(id, (oldData: { operationVal: number }) => ({
        ...oldData,
        operationVal: numValue,
      }));
    },
    [id, setNodeData],
  );

  return (
    <div className="transform-node min-w-[280px] space-y-4 rounded-lg border border-slate-600 bg-slate-800 p-4 text-white shadow-md">
      <Handle
        type="source"
        position={Position.Right}
        id="float-out"
        className={`!absolute !top-1/8 !right-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-blue-500`}
      />
      {/* Node Title */}
      <div className="mb-2 text-center">
        <div className="inline-block -translate-y-1 transform rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-bold text-white shadow-sm">
          Float
        </div>
      </div>
      {/* First Value Section */}
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <div className="flex items-center justify-between">
          <input
            value={data.operationVal}
            onChange={(e) => onOperationChange(e.target.value)}
            className="bg-transparent font-bold focus:outline-none"
          ></input>
        </div>
      </div>
    </div>
  );
}

export default FloatNode;
