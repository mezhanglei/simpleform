import DndSortable, { arrayMove, DndCondition, DndSortableProps } from 'react-dragger-sort';
import React from 'react';
import './dnd.less';
import { defaultGetId, getConfigItem, insertFormItem, setFormItem } from '../../../../utils/utils';
import { EditorSelection } from '../../../formrender';

export interface TableDndProps extends EditorSelection {
  children?: any;
}

// 表格拖放
function TableDnd(props: TableDndProps, ref: any) {
  const { children, formrender, path, field, ...rest } = props;

  const attributeName = `props.columns`;
  const currentPath = path;
  const context = field?.context;
  const { settingForm, editorConfig } = context?.state || {};

  const removeSelect = () => {
    context?.dispatch && context.dispatch({ selected: {} });
    settingForm && settingForm.reset();
  };

  const onUpdate: DndSortableProps['onUpdate'] = (params) => {
    const { from, to } = params;
    console.log(params, '同域拖放');
    const fromIndex = from?.index;
    const dropIndex = to?.index;
    if (typeof fromIndex != 'number' || typeof dropIndex !== 'number') return;
    const columns = field?.props?.columns || [];
    const oldColumns = [...columns];
    const newColumns = arrayMove(oldColumns, fromIndex, dropIndex);
    setFormItem(formrender, newColumns, currentPath, attributeName);
    removeSelect();
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
      attributeName?: string
    };
    const fromIndex = from?.index;
    if (typeof fromIndex != 'number') return;
    const dropIndex = to?.index || 0;
    let controlField;
    // 从侧边栏插入进来
    if (fromCollection?.type === 'panel') {
      const type = from?.id as string;
      controlField = getConfigItem(type, editorConfig?.widgets, editorConfig?.settings);
      // 从表单节点中插入
    } else {
      controlField = formrender && formrender.getItemByIndex(fromIndex, { path: fromCollection?.path });
      formrender && formrender.setItemByIndex(undefined, fromIndex, { path: fromCollection?.path });
    }
    // 拼接column
    const newColumn = {
      ...controlField,
      title: controlField?.label,
      dataIndex: defaultGetId(controlField.type)
    };
    insertFormItem(formrender, newColumn, dropIndex, { path: currentPath, attributeName: attributeName });
    removeSelect();
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
      className='table-dnd'
      options={{ hiddenFrom: true, disabledDrop: disabledDrop }}
      collection={{ path: currentPath, attributeName }}
    >
      {children}
    </DndSortable>
  );
};

export default React.forwardRef(TableDnd);
