import React from 'react';
import './index.less';
import FormDnd, { ControlDndProps } from '../components/common/FormDnd';
import { useEditorContext } from '../context';

// 根节点的拖放区域
function RootDnd(props: ControlDndProps) {
  const context = useEditorContext();
  return <FormDnd {...props} field={{ context: context }} />;
};

export default RootDnd;
