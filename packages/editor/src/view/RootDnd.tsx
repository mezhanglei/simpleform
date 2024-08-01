import React from 'react';
import './index.less';
import BaseDnd, { ControlDndProps } from './BaseDnd';
import { useEditorContext } from '../context';

// 根节点的拖放区域
const RootDnd: React.FC<ControlDndProps> = (props) => {
  const context = useEditorContext();
  return <BaseDnd
    {...props}
    dndList={context?.state?.widgetList || []}
    _options={{ ...props._options, context }}
  />;
};

export default RootDnd;
