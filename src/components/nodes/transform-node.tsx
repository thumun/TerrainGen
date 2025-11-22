import { useCallback } from 'react';
import { Handle, Position, type NodeProps, useReactFlow } from 'reactflow';

interface TransformNodeData {
  translate: [number, number, number];
  rotate: [number, number, number];
  scale: [number, number, number];
  uniformScale: number;
}

function TransformNode({ data, id }: NodeProps<TransformNodeData>) {
  const { setNodes } = useReactFlow();

  const translate = data.translate || [0, 0, 0];
  const rotate = data.rotate || [0, 0, 0];
  const scale = data.scale || [1, 1, 1];
  const uniformScale = data.uniformScale ?? 1;

  const onUniformScaleChange = useCallback(
    (value: string) => {
      const numValue = parseFloat(value) || 1;

      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              data: {
                ...node.data,
                uniformScale: numValue,
              },
            };
          }
          return node;
        }),
      );
    },
    [id, setNodes],
  );

  const onVecChange = useCallback(
    (axis: 'x' | 'y' | 'z', value: string, type: string) => {
      const numValue = parseFloat(value) || (type === 'scale' ? 1 : 0);
      const axisIndex = { x: 0, y: 1, z: 2 }[axis];

      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            const currentData = node.data as TransformNodeData;

            switch (type) {
              case 'translate': {
                const currentVecInfo = currentData.translate || [0, 0, 0];
                const newVecInfo: [number, number, number] = [...currentVecInfo];
                newVecInfo[axisIndex] = numValue;

                return {
                  ...node,
                  data: {
                    ...currentData,
                    translate: newVecInfo,
                  },
                };
              }
              case 'rotate': {
                const currentVecInfo = currentData.rotate || [0, 0, 0];
                const newVecInfo: [number, number, number] = [...currentVecInfo];
                newVecInfo[axisIndex] = numValue;

                return {
                  ...node,
                  data: {
                    ...currentData,
                    rotate: newVecInfo,
                  },
                };
              }
              case 'scale': {
                const currentVecInfo = currentData.scale || [1, 1, 1];
                const newVecInfo: [number, number, number] = [...currentVecInfo];
                newVecInfo[axisIndex] = numValue;

                return {
                  ...node,
                  data: {
                    ...currentData,
                    scale: newVecInfo,
                  },
                };
              }
              default: {
                return node;
              }
            }
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
        id="geo-out"
        className="!absolute !top-1/12 !right-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-pink-500"
      />

      {/* Node Title */}
      <div className="mb-2 text-center">
        <div className="inline-block -translate-y-1 transform rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-bold text-white shadow-sm">
          Transformation
        </div>
      </div>

      {/* Geometry Section */}
      <div className="relative flex items-center justify-between rounded-md bg-slate-700/50 p-3">
        <Handle
          type="target"
          position={Position.Left}
          id="geo-in"
          className="!absolute !top-1/2 !left-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-pink-500"
        />
        <label className="flex-1 text-sm font-medium">Geometry</label>
      </div>

      {/* Translate Section */}
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <Handle
          type="target"
          position={Position.Left}
          id="vec3-trans-in"
          className="!absolute !top-1/2 !left-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-green-500"
        />
        <label className="text-sm font-medium">Translation</label>
        <div className="flex justify-center space-x-2">
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">X</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={translate[0]}
              onChange={(e) => onVecChange('x', e.target.value, 'translate')}
              type="number"
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Y</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={translate[1]}
              onChange={(e) => onVecChange('y', e.target.value, 'translate')}
              type="number"
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Z</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={translate[2]}
              onChange={(e) => onVecChange('z', e.target.value, 'translate')}
              type="number"
            />
          </div>
        </div>
      </div>

      {/* Rotate Section */}
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <Handle
          type="target"
          position={Position.Left}
          id="vec3-rotate-in"
          className="!absolute !top-1/2 !left-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-green-500"
        />
        <label className="text-sm font-medium">Rotation</label>
        <div className="flex justify-center space-x-2">
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">X</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={rotate[0]}
              onChange={(e) => onVecChange('x', e.target.value, 'rotate')}
              type="number"
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Y</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={rotate[1]}
              onChange={(e) => onVecChange('y', e.target.value, 'rotate')}
              type="number"
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Z</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={rotate[2]}
              onChange={(e) => onVecChange('z', e.target.value, 'rotate')}
              type="number"
            />
          </div>
        </div>
      </div>

      {/* Scale Section */}
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <Handle
          type="target"
          position={Position.Left}
          id="vec3-scale-in"
          className="!absolute !top-1/2 !left-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-green-500"
        />
        <label className="text-sm font-medium">Scale</label>
        <div className="flex justify-center space-x-2">
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">X</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={scale[0]}
              onChange={(e) => onVecChange('x', e.target.value, 'scale')}
              type="number"
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Y</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={scale[1]}
              onChange={(e) => onVecChange('y', e.target.value, 'scale')}
              type="number"
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Z</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={scale[2]}
              onChange={(e) => onVecChange('z', e.target.value, 'scale')}
              type="number"
            />
          </div>
        </div>
      </div>

      {/* Uniform Scale Section */}
      <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
        <Handle
          type="target"
          position={Position.Left}
          id="float-scale-in"
          className="!absolute !top-1/2 !left-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-blue-500"
        />
        <label className="text-sm font-medium">Uniform Scale</label>
        <input
          className="w-full rounded border border-slate-500 bg-slate-600 p-2 text-center text-white focus:border-blue-400 focus:outline-none"
          value={uniformScale}
          onChange={(e) => onUniformScaleChange(e.target.value)}
          type="number"
        />
      </div>
    </div>
  );
}

export default TransformNode;
