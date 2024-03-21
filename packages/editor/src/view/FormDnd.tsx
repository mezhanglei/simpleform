import { ReactSortable, SortableOptions } from "react-sortablejs";
import React from 'react';
import './FormDnd.less';
import { defaultGetId, getConfigItem, insertWidgetItem, moveWidgetItem } from '../utils/utils';
import { CommonWidgetProps, getParent, joinFormPath } from '../components/formrender';

export interface ControlDndProps extends CommonWidgetProps {
  children?: any;
  dndList: Array<any>;
}

// 控件的拖放区域组件
function FormDnd(props: ControlDndProps, ref: any) {
  const { children, formrender, path, widgetItem, dndList, ...rest } = props;
  const context = widgetItem?.context;
  const { editorConfig, historyRecord } = context?.state || {};

  const onUpdate: SortableOptions['onUpdate'] = (params) => {
    const fromParent = getParent(params?.item?.dataset?.path);
    const fromIndex = params?.oldIndex;
    if (typeof fromIndex !== 'number') return;
    const dropIndex = params?.newIndex;
    const dropPath = joinFormPath(path, dropIndex);
    moveWidgetItem(formrender, { index: fromIndex, parent: fromParent }, { index: dropIndex, parent: fromParent });
    context?.dispatch((old) => ({ ...old, selected: Object.assign(old?.selected, { path: dropPath }) }));
    historyRecord?.save();
    console.log(params, fromParent, dropPath, '同域拖放');
  };

  const onAdd: SortableOptions['onAdd'] = (params) => {
    console.log(params, '跨域拖放');
    const isPanel = params?.item?.dataset?.group == 'panel';
    // 从侧边栏插入进来
    if (isPanel) {
      const fromId = params?.item?.dataset?.type;
      const dropIndex = params?.newIndex;
      const dropParent = path;
      const dropPath = joinFormPath(dropParent, dropIndex);
      const configItem = getConfigItem(fromId, editorConfig);
      const newItem = configItem?.panel?.nonform ? configItem : Object.assign({ name: defaultGetId(fromId) }, configItem);
      insertWidgetItem(formrender, newItem, dropIndex, path);
      context?.dispatch((old) => ({ ...old, selected: Object.assign(old?.selected, { path: dropPath }) }));
    } else {
      const fromParent = getParent(params?.item?.dataset?.path);
      const fromIndex = params?.oldIndex;
      if (typeof fromIndex !== 'number') return;
      const dropIndex = params?.newIndex;
      const dropParent = path;
      const dropPath = joinFormPath(dropParent, dropIndex);
      moveWidgetItem(formrender, { index: fromIndex, parent: fromParent }, { index: dropIndex, parent: dropParent });
      context?.dispatch((old) => ({ ...old, selected: Object.assign(old?.selected, { path: dropPath }) }));
    }
    historyRecord?.save();
  };

  return (
    <ReactSortable
      list={dndList}
      setList={() => { }}
      group={{
        name: "sort-field",
        pull: "clone",
        put: ['sort-field', 'panel']
      }}
      ref={ref}
      onUpdate={onUpdate}
      onAdd={onAdd}
      className='editor-dnd'
      {...rest}
    >
      {children}
    </ReactSortable>
  );
};

export default React.forwardRef(FormDnd);
