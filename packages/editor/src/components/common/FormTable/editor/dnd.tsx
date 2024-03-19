import DndSortable, { arrayMove, DndSortableProps } from 'react-dragger-sort';
import React from 'react';
import './dnd.less';
import { defaultGetId, getConfigItem, setWidgetItem } from '../../../../utils/utils';
import { joinFormPath, CommonWidgetProps } from '../../../formrender';

export interface TableDndProps extends CommonWidgetProps {
  children?: any;
}

// 表格拖放
function TableDnd(props: TableDndProps, ref: any) {
  const { children, formrender, path, widgetItem, ...rest } = props;
  const context = widgetItem?.context;
  const columns = widgetItem?.props?.columns || [];
  const columnsPath = joinFormPath(path, 'props.columns');
  const { settingForm, editorConfig, historyRecord } = context?.state || {};

  const updateContext = () => {
    context?.dispatch && context.dispatch((old) => ({ ...old, selected: {} }));
    settingForm && settingForm.reset();
    historyRecord?.save();
  };

  const onUpdate: DndSortableProps['onUpdate'] = (params) => {
    const { from, to } = params;
    console.log(params, '同域拖放');
    const fromIndex = from?.index;
    const dropIndex = to?.index;
    if (typeof fromIndex != 'number' || typeof dropIndex !== 'number') return;
    const cloneColumns = [...columns];
    const newColumns = arrayMove(cloneColumns, fromIndex, dropIndex);
    setWidgetItem(formrender, newColumns, columnsPath);
    updateContext();
  };

  const onAdd: DndSortableProps['onAdd'] = (params) => {
    const { from, to } = params;
    console.log(params, '跨域拖放');
    // 拖拽区域信息
    const fromGroup = from.group;
    // 额外传递的信息
    const fromCollection = fromGroup?.collection as {
      type?: string;
      path?: string;
    };
    const fromIndex = from?.index;
    if (typeof fromIndex != 'number') return;
    const dropIndex = to?.index || 0;
    let widgetItem;
    // 从侧边栏插入进来
    if (fromCollection?.type === 'panel') {
      const type = from?.id as string;
      widgetItem = getConfigItem(type, editorConfig);
      // 从表单节点中插入
    } else {
      widgetItem = formrender && formrender.getItemByIndex(fromIndex, fromCollection?.path);
      formrender && formrender.setItemByIndex(undefined, fromIndex, fromCollection?.path);
    }
    // 拼接column
    const id = defaultGetId(widgetItem.type);
    const newColumn = {
      ...widgetItem,
      title: widgetItem?.label,
      dataIndex: id,
    };
    const cloneColumns = [...columns];
    cloneColumns.splice(dropIndex, 0, newColumn);
    setWidgetItem(formrender, cloneColumns, columnsPath);
    updateContext();
  };

  return (
    <DndSortable
      ref={ref}
      onUpdate={onUpdate}
      onAdd={onAdd}
      className='table-dnd'
      options={{ hiddenFrom: true }}
      collection={{ path: columnsPath }}
    >
      {children}
    </DndSortable>
  );
};

export default React.forwardRef(TableDnd);
