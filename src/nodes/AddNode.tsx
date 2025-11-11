import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';

function AddNode() {
  const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    console.log(evt.target.value);
  }, []);

  return (
    <div className="add-node">
      <div className="node-row">
      <Handle type="target" position={Position.Left} id="add-in" style={{ top: '0%' }} />
        <label>Value</label>
        <div className="triple-input">
          <input id="valueOnex" name="valueOnex" onChange={onChange} />
          <input id="valueOney" name="valueOney" onChange={onChange} />
          <input id="valueOnez" name="valueOnez" onChange={onChange} />
        </div>
        <Handle type="target" position={Position.Left} id="add-in" style={{ top: '15%' }} />
        <label>Value</label>
        <div className="triple-input">
          <input id="valueTwox" name="valueTwox" onChange={onChange} />
          <input id="valueTwoy" name="valueTwoy" onChange={onChange} />
          <input id="valueTwoz" name="valueTwoz" onChange={onChange} />
        </div>
      <Handle type="source" position={Position.Right} id="add-out" style={{ top: '0%' }} />
      </div>
    </div>
  );
}

export default AddNode;