import { Handle, Position } from 'reactflow';

import * as styles from './styles';
import type * as types from './types';

export type HandleOutputProps = {
  handleId: string;
  valueType: types.ValueType;
  /** Vertical offset (integer) in case of multiple outputs */
  offset?: number;
};

export default function HandleOutput({ handleId, valueType, offset = 0 }: HandleOutputProps) {
  const colorClassName = styles.VALUE_TYPE_CLASSNAMES[valueType];

  return (
    <Handle
      type="source"
      position={Position.Right}
      id={handleId}
      className={`absolute! top-[calc(var(--spacing)*(10+var(--vert-offset)*8))]! -right-2! h-3! w-3! -translate-y-1/2! ${colorClassName}`}
      style={{ '--vert-offset': offset } as React.CSSProperties}
    />
  );
}
