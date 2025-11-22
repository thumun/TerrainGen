import { useCallback } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

import { useNodeData } from '@/hooks/use-node-data';
import * as nodeTypes from '@/lib/graph/node-types';

type NodeData = nodeTypes.TrigMathFloat['data'];
const HANDLES = nodeTypes.HANDLES.trigMathFloat;

function TrigMathNodeFloat({ id, data }: NodeProps<NodeData>) {
  const { setNodeData } = useNodeData();

  const onOperationChange = useCallback(
    (evt: React.ChangeEvent<HTMLSelectElement>) => {
      setNodeData(id, (oldData: { operationVal: number }) => ({
        ...oldData,
        operationVal: evt.target.value || 'Sin',
      }));
    },
    [id, setNodeData],
  );

  return (
    <div className="transform-node min-w-[280px] space-y-4 rounded-lg border border-slate-600 bg-slate-800 p-4 text-white shadow-md">
      <Handle
        type="source"
        position={Position.Right}
        id={HANDLES.out.result}
        className={`!absolute !top-1/8 !right-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-blue-500`}
      />

      {/* Node Title */}
      <div className="mb-2 text-center">
        <div className="inline-block -translate-y-1 transform rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-bold text-white shadow-sm">
          Trig Math (Float)
        </div>
      </div>

      {/* Value Section */}
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <Handle
          type="target"
          position={Position.Left}
          id={HANDLES.in.input}
          className="!absolute !top-1/2 !left-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-blue-500"
        />
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Value</label>
        </div>
      </div>

      {/* Type of Node */}
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Function</label>
          <div className="inline-flex -translate-y-1 transform items-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-green-600 px-4 py-2 font-bold text-white shadow-sm">
            <select
              value={data.operationVal}
              onChange={onOperationChange}
              className="bg-transparent font-bold focus:outline-none"
            >
              <option value="Add" className="bg-slate-800 text-white">
                Sine
              </option>
              <option value="Sub" className="bg-slate-800 text-white">
                Cosine
              </option>
              <option value="Mult" className="bg-slate-800 text-white">
                Tangent
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrigMathNodeFloat;
