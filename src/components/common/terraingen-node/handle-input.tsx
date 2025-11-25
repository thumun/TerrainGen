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
    <div className="relative flex flex-col space-y-2 rounded-md bg-zinc-600/50 px-3 py-2">
      <Handle
        type="target"
        position={Position.Left}
        id={handleId}
        className={`absolute! top-[calc(50%+var(--spacing)*1.5)]! -left-[calc(var(--spacing)*5.63)]! h-3! w-3! -translate-y-1/2! ${colorClassName}`}
      />
      <div className="flex items-center justify-between">
        <label className="text-sm font-normal">{label}</label>
      </div>
    </div>
  );
}
