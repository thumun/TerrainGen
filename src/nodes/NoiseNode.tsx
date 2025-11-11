import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';

function NoiseNode() {
  const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    console.log(evt.target.value);
  }, []);

  return (
    <div className="noise-node">
      <div className="node-row">
        <Handle type="target" position={Position.Left} id="translate-in" style={{ top: '15%' }} />
        <label>Input</label>
        <div className="triple-input">
          <input id="tx" name="tx" onChange={onChange} />
          <input id="ty" name="ty" onChange={onChange} />
          <input id="tz" name="tz" onChange={onChange} />
        </div>
      </div>
    </div>
  );
}

export default NoiseNode;