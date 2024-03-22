import React from 'react';
import './index.less';
import BaseDnd, { ControlDndProps } from './BaseDnd';
import { useEditorContext } from '../context';

// 根节点的拖放区域
function RootDnd(props: ControlDndProps) {
  const context = useEditorContext();
  return <BaseDnd
    {...props}
    dndList={context?.state?.widgetList || []}
    widgetItem={{ context: context }} />;
};

export default RootDnd;
