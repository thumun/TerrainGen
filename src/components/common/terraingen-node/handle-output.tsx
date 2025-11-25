import { Handle, Position } from 'reactflow';

import * as styles from './styles';
import type * as types from './types';

export type HandleOutputProps = {
  handleId: string;
  valueType: types.ValueType;
  label?: string;
};

export default function HandleOutput({
  handleId,
  valueType,
  label = 'Result',
}: HandleOutputProps) {
  const colorClassName = styles.VALUE_TYPE_CLASSNAMES[valueType];

  return (
    <div className="relative flex flex-col space-y-2 rounded-md px-3 py-2">
      <Handle
        type="source"
        position={Position.Right}
        id={handleId}
        className={`absolute! top-[calc(50%+var(--spacing)*1.5)]! -right-[calc(var(--spacing)*5.63)]! h-3! w-3! -translate-y-1/2! ${colorClassName}`}
      />
      <label className="text-right font-normal">{label}</label>
    </div>
  );
}
