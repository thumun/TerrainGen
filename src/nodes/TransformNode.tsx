import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';

function TransformNode() {
  const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    console.log(evt.target.value);
  }, []);

  return (
    <div className="transform-node">
      <div className="node-row">
      <Handle type="target" position={Position.Left} id="translate-in" style={{ top: '0%' }} />
        <label>Geometry</label>
      <Handle type="source" position={Position.Right} id="translate-out" style={{ top: '0%' }} />
      </div>

      <div className="node-row">
        <Handle type="target" position={Position.Left} id="translate-in" style={{ top: '15%' }} />
        <label>Translate</label>
        <div className="triple-input">
          <input id="tx" name="tx" onChange={onChange} />
          <input id="ty" name="ty" onChange={onChange} />
          <input id="tz" name="tz" onChange={onChange} />
        </div>
      </div>

      <div className="node-row">
        <Handle type="target" position={Position.Left} id="rotate-in" style={{ top: '45%' }} />
        <label>Rotate</label>
        <div className="triple-input">
          <input id="rx" name="rx" onChange={onChange} />
          <input id="ry" name="ry" onChange={onChange} />
          <input id="rz" name="rz" onChange={onChange} />
        </div>
      </div>

      <div className="node-row">
        <Handle type="target" position={Position.Left} id="scale-in" style={{ top: '75%' }} />
        <label>Scale</label>
        <div className="triple-input">
          <input id="sx" name="sx" onChange={onChange} />
          <input id="sy" name="sy" onChange={onChange} />
          <input id="sz" name="sz" onChange={onChange} />
        </div>
      </div>

      <div className="node-row">
        <Handle type="target" position={Position.Left} id="scale-in" style={{ top: '75%' }} />
        <label>Uniform Scale</label>
        <div className="triple-input">
          <input id="sx" name="sx" onChange={onChange} />
        </div>
      </div>

    </div>
  );
}

export default TransformNode;