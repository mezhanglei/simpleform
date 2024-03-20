import { ReactSortable, SortableOptions } from "react-sortablejs";
import React from 'react';
import './dnd.less';
import { defaultGetId, getConfigItem, insertWidgetItem, moveWidgetItem } from '../../../../utils/utils';
import { joinFormPath, CommonWidgetProps, getParent } from '../../../formrender';

export interface TableDndProps extends CommonWidgetProps {
  children?: any;
}
// 表格拖放
function TableDnd(props: TableDndProps, ref: any) {
  const { children, formrender, path, widgetItem, ...rest } = props;
  const context = widgetItem?.context;
  const columns = widgetItem?.props?.columns || [];
  const columnsPath = joinFormPath(path, 'props.columns');
  const { editorConfig, historyRecord } = context?.state || {};

  const onUpdate: SortableOptions['onUpdate'] = (params) => {
    const fromParent = columnsPath;
    const fromIndex = params?.oldIndex;
    if (typeof fromIndex !== 'number') return;
    const dropIndex = params?.newIndex;
    const dropPath = joinFormPath(columnsPath, dropIndex);
    moveWidgetItem(formrender, { index: fromIndex, parent: fromParent }, { index: dropIndex, parent: fromParent });
    context?.dispatch && context.dispatch((old) => ({ ...old, selected: Object.assign(old?.selected, { path: dropPath }) }));
    historyRecord?.save();
  };

  const onAdd: SortableOptions['onAdd'] = (params) => {
    const isPanel = params?.item?.dataset?.group == 'panel';
    // 从侧边栏插入进来
    if (isPanel) {
      const fromId = params?.item?.dataset?.type;
      const dropIndex = params?.newIndex;
      const dropParent = columnsPath;
      const dropPath = joinFormPath(dropParent, dropIndex);
      const configItem = getConfigItem(fromId, editorConfig);
      const newItem = configItem?.panel?.nonform ? configItem : Object.assign({ name: defaultGetId(fromId) }, configItem);
      insertWidgetItem(formrender, newItem, dropIndex, dropParent);
      context?.dispatch && context.dispatch((old) => ({ ...old, selected: Object.assign(old?.selected, { path: dropPath }) }));
    } else {
      const fromParent = getParent(params?.item?.dataset?.path);
      const fromIndex = params?.oldIndex;
      if (typeof fromIndex !== 'number') return;
      const dropIndex = params?.newIndex;
      const dropParent = path;
      const dropPath = joinFormPath(dropParent, dropIndex);
      moveWidgetItem(formrender, { index: fromIndex, parent: fromParent }, { index: dropIndex, parent: dropParent });
      context?.dispatch && context.dispatch((old) => ({ ...old, selected: Object.assign(old?.selected, { path: dropPath }) }));
    }
    historyRecord?.save();
  };

  return (
    <ReactSortable
      list={columns}
      setList={() => { }}
      group={{
        name: "table-columns",
        put: ['sort-field', 'panel']
      }}
      ref={ref}
      onUpdate={onUpdate}
      onAdd={onAdd}
      className='table-dnd'
    >
      {children}
    </ReactSortable>
  );
};

export default React.forwardRef(TableDnd);
