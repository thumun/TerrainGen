import { Handle, Position } from 'reactflow';

import * as styles from './styles';
import type * as types from './types';

export type HandleInputProps = {
  handleId: string;
  valueType: types.ValueType;
  label: string;
};

export default function HandleInput({ handleId, valueType, label }: HandleInputProps) {
  const colorClassName = styles.VALUE_TYPE_CLASSNAMES[valueType];

  return (
    <div className="relative flex flex-col space-y-2 rounded-md bg-slate-700/50 p-3">
      <Handle
        type="target"
        position={Position.Left}
        id={handleId}
        className={`absolute! top-1/2! -left-6! h-3! w-3! -translate-y-1/2! ${colorClassName}`}
      />
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
      </div>
    </div>
  );
}
