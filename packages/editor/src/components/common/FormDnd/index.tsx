import DndSortable, { DndCondition, DndSortableProps } from 'react-dragger-sort';
import React from 'react';
import './index.less';
import { getConfigItem, insertFormItem } from '../../../utils/utils';
import { EditorSelection } from '../../formrender';

export interface ControlDndProps extends EditorSelection {
  children?: any;
}

// 控件的拖放区域组件
function FormDnd(props: ControlDndProps, ref: any) {
  const { children, formrender, path, widgetItem, ...rest } = props;
  const context = widgetItem?.context;
  const { editorConfig, historyRecord } = context?.state || {};

  const currentPath = path;

  const onUpdate: DndSortableProps['onUpdate'] = (params) => {
    const { from, to } = params;
    console.log(params, '同域拖放');
    // 拖拽区域信息
    const fromGroup = from.group;
    // 额外传递的信息
    const fromCollection = fromGroup?.collection;
    const fromIndex = from?.index;
    if (typeof fromIndex != 'number') return;
    // 拖放区域的信息
    const dropGroup = to?.group;
    // 额外传递的信息
    const dropCollection = dropGroup?.collection;
    const dropIndex = to?.index;
    formrender?.moveItemByPath({ index: fromIndex, parent: fromCollection?.path }, { index: dropIndex, parent: dropCollection?.path });
    historyRecord?.save();
  };

  const onAdd: DndSortableProps['onAdd'] = (params) => {
    const { from, to } = params;
    console.log(params, '跨域拖放');
    // 拖拽区域信息
    const fromGroup = from.group;
    // 额外传递的信息
    const fromCollection = fromGroup?.collection;
    const fromIndex = from?.index;
    if (typeof fromIndex != 'number') return;
    // 拖放区域的信息
    const dropGroup = to?.group;
    // 额外传递的信息
    const dropCollection = dropGroup?.collection;
    const dropIndex = to?.index || 0;
    // 从侧边栏插入进来
    if (fromCollection?.type === 'panel') {
      const type = from?.id as string;
      const configItem = getConfigItem(type, editorConfig);
      insertFormItem(formrender, configItem, dropIndex, { path: dropCollection?.path });
    } else {
      formrender?.moveItemByPath({ index: fromIndex, parent: fromCollection?.path }, { index: dropIndex, parent: dropCollection?.path });
    }
    historyRecord?.save();
  };

  const disabledDrop: DndCondition = (param) => {
    // 如果目标来自于attributeName，则不允许放进来
    const fromCollection = param?.from?.group?.collection;
    if (fromCollection?.attributeName) {
      return true;
    }
  };

  return (
    <DndSortable
      ref={ref}
      onUpdate={onUpdate}
      onAdd={onAdd}
      className='editor-dnd'
      options={{ hiddenFrom: true, disabledDrop: disabledDrop }}
      collection={{ path: currentPath }}
      {...rest}
    >
      {children}
    </DndSortable>
  );
};

export default React.forwardRef(FormDnd);
