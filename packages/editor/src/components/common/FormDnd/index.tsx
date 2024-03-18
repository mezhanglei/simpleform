import DndSortable, { DndSortableProps } from 'react-dragger-sort';
import React from 'react';
import './index.less';
import { defaultGetId, getConfigItem, insertWidgetItem } from '../../../utils/utils';
import { joinFormPath, EditorSelection } from '../../formrender';

export interface ControlDndProps extends EditorSelection {
  children?: any;
}

// 控件的拖放区域组件
function FormDnd(props: ControlDndProps, ref: any) {
  const { children, formrender, path, widgetItem, ...rest } = props;
  const context = widgetItem?.context;
  const { editorConfig, historyRecord } = context?.state || {};

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
      const newItem = configItem?.panel?.nonform ? configItem : Object.assign({ name: defaultGetId(type) }, configItem);
      insertWidgetItem(formrender, newItem, dropIndex, dropCollection?.path);
    } else {
      formrender?.moveItemByPath({ index: fromIndex, parent: fromCollection?.path }, { index: dropIndex, parent: dropCollection?.path });
    }
    historyRecord?.save();
  };

  return (
    <DndSortable
      ref={ref}
      onUpdate={onUpdate}
      onAdd={onAdd}
      className='editor-dnd'
      options={{ hiddenFrom: true }}
      collection={{ path: path, name: widgetItem?.name }}
      {...rest}
    >
      {children}
    </DndSortable>
  );
};

export default React.forwardRef(FormDnd);
