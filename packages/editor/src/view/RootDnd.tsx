import React from 'react';
import './index.less';
import FormDnd, { ControlDndProps } from './FormDnd';
import { useEditorContext } from '../context';

// 根节点的拖放区域
function RootDnd(props: ControlDndProps) {
  const context = useEditorContext();
  return <FormDnd {...props} dndList={context?.state?.widgetList || []} widgetItem={{ context: context }} />;
};

export default RootDnd;
