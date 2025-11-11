import { useCallback, useState } from 'react';
import { Handle, Position } from 'reactflow';

function TransformNode() {
  const [translate, setTranslate] = useState({ x: 0, y: 0, z: 0 });
  const [rotate, setRotate] = useState({ x: 0, y: 0, z: 0 });
  const [scale, setScale] = useState({ x: 1, y: 1, z: 1 });
  const [uniformScale, setUniformScale] = useState(1);

  // how this works:
  // attach to our box, based on param, str->float & update above state
  const onTranslateChange = useCallback((axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = parseFloat(value) || 0;
    setTranslate((prev) => ({ ...prev, [axis]: numValue }));
  }, []);

  const onRotateChange = useCallback((axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = parseFloat(value) || 0;
    setRotate((prev) => ({ ...prev, [axis]: numValue }));
  }, []);

  const onScaleChange = useCallback((axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = parseFloat(value) || 1;
    setScale((prev) => ({ ...prev, [axis]: numValue }));
  }, []);

  const onUniformScaleChange = useCallback((value: string) => {
    const numValue = parseFloat(value) || 1;
    setUniformScale(numValue);
  }, []);

  return (
    <div className="transform-node min-w-[280px] space-y-4 rounded-lg border border-slate-600 bg-slate-800 p-4 text-white shadow-md">
      <Handle
        type="source"
        position={Position.Right}
        id="geo-out"
        className="!absolute !top-1/12 !right-[-8px] !h-3 !w-3 !-translate-y-1/2 !bg-pink-500"
        data-handle="pink"
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
          data-handle="pink"
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
          data-handlecolor="green"
        />
        <label className="text-sm font-medium">Translation</label>
        <div className="flex justify-center space-x-2">
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">X</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={translate.x}
              onChange={(e) => onTranslateChange('x', e.target.value)}
              type="number"
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Y</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={translate.y}
              onChange={(e) => onTranslateChange('y', e.target.value)}
              type="number"
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Z</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={translate.z}
              onChange={(e) => onTranslateChange('z', e.target.value)}
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
          data-handlecolor="green"
        />
        <label className="text-sm font-medium">Rotation</label>
        <div className="flex justify-center space-x-2">
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">X</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={rotate.x}
              onChange={(e) => onRotateChange('x', e.target.value)}
              type="number"
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Y</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={rotate.y}
              onChange={(e) => onRotateChange('y', e.target.value)}
              type="number"
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Z</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={rotate.z}
              onChange={(e) => onRotateChange('z', e.target.value)}
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
          data-handlecolor="green"
        />
        <label className="text-sm font-medium">Scale</label>
        <div className="flex justify-center space-x-2">
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">X</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={scale.x}
              onChange={(e) => onScaleChange('x', e.target.value)}
              type="number"
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Y</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={scale.y}
              onChange={(e) => onScaleChange('y', e.target.value)}
              type="number"
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Z</span>
            <input
              className="w-12 rounded border border-slate-500 bg-slate-600 p-1 text-center text-white focus:border-blue-400 focus:outline-none"
              value={scale.z}
              onChange={(e) => onScaleChange('z', e.target.value)}
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
          data-handlecolor="blue"
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
