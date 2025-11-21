import { useCallback } from 'react';
import { Handle, Position, type NodeProps, useReactFlow } from 'reactflow';

interface VectorNodeData {
  vecInfo: [number, number, number];
}

function VectorNode({ data, id }: NodeProps<VectorNodeData>) {
  const vecInfo = data.vecInfo || [0, 0, 0];

  const { setNodes } = useReactFlow();

  const onVecChange = useCallback(
    (axis: 'x' | 'y' | 'z', value: string) => {
      const numValue = parseFloat(value) || 0;
      const axisIndex = { x: 0, y: 1, z: 2 }[axis];

      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const currentVecInfo = node.data.vecInfo || [0, 0, 0];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const newVecInfo: [number, number, number] = currentVecInfo;
            newVecInfo[axisIndex] = numValue;

            return {
              ...node,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              data: {
                ...node.data,
                operationVal: newVecInfo,
              },
            };
          }
          return node;
        }),
      );
    },
    [id, setNodes],
  );

  return (
    <div className="transform-node min-w-[280px] space-y-4 rounded-lg border border-slate-600 bg-slate-800 p-4 text-white shadow-md">
      <Handle
        type="source"
        position={Position.Right}
        id="vec3-out"
        className="!absolute !top-1/12 !right-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-green-500"
      />

      {/* Node Title */}
      <div className="mb-2 text-center">
        <div className="inline-block -translate-y-1 transform rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-bold text-white shadow-sm">
          Vec3
        </div>
      </div>

      {/* Input Section */}
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <div className="flex justify-center space-x-2">
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">X</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={vecInfo[0]}
              onChange={(e) => onVecChange('x', e.target.value)}
              type="number"
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Y</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={vecInfo[1]}
              onChange={(e) => onVecChange('y', e.target.value)}
              type="number"
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Z</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={vecInfo[2]}
              onChange={(e) => onVecChange('z', e.target.value)}
              type="number"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default VectorNode;
