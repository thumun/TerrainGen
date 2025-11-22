import { Handle, Position } from 'reactflow';

import * as styles from './styles';
import type * as types from './types';

export type HandleOutputProps = {
  handleId: string;
  valueType: types.ValueType;
};

export default function HandleOutput({ handleId, valueType }: HandleOutputProps) {
  const colorClassName = styles.VALUE_TYPE_CLASSNAMES[valueType];

  return (
    <Handle
      type="source"
      position={Position.Right}
      id={handleId}
      className={`absolute! top-1/8! -right-2! h-3! w-3! -translate-y-1/2! ${colorClassName}`}
    />
  );
}
