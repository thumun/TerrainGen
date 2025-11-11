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
    setTranslate(prev => ({ ...prev, [axis]: numValue }));
  }, []);

  const onRotateChange = useCallback((axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = parseFloat(value) || 0;
    setRotate(prev => ({ ...prev, [axis]: numValue }));
  }, []);

  const onScaleChange = useCallback((axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = parseFloat(value) || 1;
    setScale(prev => ({ ...prev, [axis]: numValue }));
  }, []);

  const onUniformScaleChange = useCallback((value: string) => {
    const numValue = parseFloat(value) || 1;
    setUniformScale(numValue);
  }, []);

  return (
    <div className="transform-node bg-slate-800 text-white p-4 rounded-lg shadow-md min-w-[280px] space-y-4 border border-slate-600">
      
      <Handle
        type="source"
        position={Position.Right}
        id="geo-out"
        className="!absolute !right-[-8px] !top-1/12 !-translate-y-1/2 !w-3 !h-3 !bg-pink-500"
        data-handle="pink"
      />

      {/* Node Title */}
      <div className="text-center mb-2">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 px-4 rounded-md shadow-sm inline-block transform -translate-y-1">
          Transformation
        </div>
      </div>

      {/* Geometry Section */}
      <div className="relative flex items-center justify-between bg-slate-700/50 p-3 rounded-md">
        <Handle
          type="target"
          position={Position.Left}
          id="geo-in"
          className="!absolute !left-[-8px] !top-1/2 !-translate-y-1/2 !w-3 !h-3 !bg-pink-500"
          data-handle="pink"
        />
        <label className="text-sm font-medium flex-1">Geometry</label>
      </div>

      {/* Translate Section */}
      <div className="relative flex flex-col space-y-2 bg-slate-700/50 p-3 rounded-md">
        <Handle
          type="target"
          position={Position.Left}
          id="vec3-trans-in"
          className="!absolute !left-[-8px] !top-1/2 !-translate-y-1/2 !w-3 !h-3 !bg-green-500"
          data-handlecolor="green"
        />
        <label className="text-sm font-medium">Translation</label>
        <div className="flex space-x-2 justify-center">
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">X</span>
            <input 
              className="w-12 bg-slate-600 text-white text-center rounded p-1 border border-slate-500 focus:border-blue-400 focus:outline-none" 
              value={translate.x}
              onChange={(e) => onTranslateChange('x', e.target.value)}
              type='number'
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Y</span>
            <input 
              className="w-12 bg-slate-600 text-white text-center rounded p-1 border border-slate-500 focus:border-blue-400 focus:outline-none" 
              value={translate.y}
              onChange={(e) => onTranslateChange('y', e.target.value)}
              type='number'
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Z</span>
            <input 
              className="w-12 bg-slate-600 text-white text-center rounded p-1 border border-slate-500 focus:border-blue-400 focus:outline-none" 
              value={translate.z}
              onChange={(e) => onTranslateChange('z', e.target.value)}
              type='number'
            />
          </div>
        </div>
      </div>

      {/* Rotate Section */}
      <div className="relative flex flex-col space-y-2 bg-slate-700/50 p-3 rounded-md">
        <Handle
          type="target"
          position={Position.Left}
          id="vec3-rotate-in"
          className="!absolute !left-[-8px] !top-1/2 !-translate-y-1/2 !w-3 !h-3 !bg-green-500"
          data-handlecolor="green"
        />
        <label className="text-sm font-medium">Rotation</label>
        <div className="flex space-x-2 justify-center">
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">X</span>
            <input 
              className="w-12 bg-slate-600 text-white text-center rounded p-1 border border-slate-500 focus:border-blue-400 focus:outline-none" 
              value={rotate.x}
              onChange={(e) => onRotateChange('x', e.target.value)}
              type='number'
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Y</span>
            <input 
              className="w-12 bg-slate-600 text-white text-center rounded p-1 border border-slate-500 focus:border-blue-400 focus:outline-none" 
              value={rotate.y}
              onChange={(e) => onRotateChange('y', e.target.value)}
              type='number'
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Z</span>
            <input 
              className="w-12 bg-slate-600 text-white text-center rounded p-1 border border-slate-500 focus:border-blue-400 focus:outline-none" 
              value={rotate.z}
              onChange={(e) => onRotateChange('z', e.target.value)}
              type='number'
            />
          </div>
        </div>
      </div>

      {/* Scale Section */}
      <div className="relative flex flex-col space-y-2 bg-slate-700/50 p-3 rounded-md">
        <Handle
          type="target"
          position={Position.Left}
          id="vec3-scale-in"
          className="!absolute !left-[-8px] !top-1/2 !-translate-y-1/2 !w-3 !h-3 !bg-green-500"
          data-handlecolor="green"
        />
        <label className="text-sm font-medium">Scale</label>
        <div className="flex space-x-2 justify-center">
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">X</span>
            <input 
              className="w-12 bg-slate-600 text-white text-center rounded p-1 border border-slate-500 focus:border-blue-400 focus:outline-none" 
              value={scale.x}
              onChange={(e) => onScaleChange('x', e.target.value)}
              type='number'
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Y</span>
            <input 
              className="w-12 bg-slate-600 text-white text-center rounded p-1 border border-slate-500 focus:border-blue-400 focus:outline-none" 
              value={scale.y}
              onChange={(e) => onScaleChange('y', e.target.value)}
              type='number'
            />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-300">Z</span>
            <input 
              className="w-12 bg-slate-600 text-white text-center rounded p-1 border border-slate-500 focus:border-blue-400 focus:outline-none" 
              value={scale.z}
              onChange={(e) => onScaleChange('z', e.target.value)}
              type='number'
            />
          </div>
        </div>
      </div>

      {/* Uniform Scale Section */}
      <div className="relative flex flex-col space-y-2 bg-slate-700/50 p-3 rounded-md">
        <Handle
          type="target"
          position={Position.Left}
          id="float-scale-in"
          className="!absolute !left-[-8px] !top-1/2 !-translate-y-1/2 !w-3 !h-3 !bg-blue-500"
          data-handlecolor="blue"
        />
        <label className="text-sm font-medium">Uniform Scale</label>
        <input 
          className="w-full bg-slate-600 text-white text-center rounded p-2 border border-slate-500 focus:border-blue-400 focus:outline-none" 
          value={uniformScale}
          onChange={(e) => onUniformScaleChange(e.target.value)}
          type='number'
        />
      </div>
    </div>
  );
}

export default TransformNode;