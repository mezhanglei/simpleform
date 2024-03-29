import { ReactSortable, ReactSortableProps } from "react-sortablejs";
import React, { CSSProperties } from 'react';
import { defaultGetId, getConfigItem, insertWidgetItem, moveWidgetItem } from '../utils/utils';
import { CommonWidgetProps, getParent, joinFormPath } from '../formrender';
import './BaseDnd.less';

export interface ControlDndProps extends Omit<CommonWidgetProps, 'onChange'>, Partial<ReactSortableProps<any>> {
  className?: string;
  style?: CSSProperties;
  children?: any;
  dndPath?: string;
  dndList?: Array<any>;
}

// 控件的拖放区域组件
function BaseDnd(props: ControlDndProps & Record<string, any>, ref: any) {
  const { children, formrender, widgetItem, dndPath, dndList = [], setList = () => { }, ...rest } = props;
  const context = widgetItem?.context;
  const { editorConfig, historyRecord } = context?.state || {};

  const onUpdate: ReactSortableProps<any>['onUpdate'] = (params) => {
    const newIndex = params?.oldIndex;
    if (typeof newIndex !== 'number') return;
    const dropIndex = params?.newIndex;
    const dropParent = dndPath;
    moveWidgetItem(formrender, { index: newIndex, parent: dropParent }, { index: dropIndex, parent: dropParent });
    context?.dispatch((old) => ({ ...old, selected: Object.assign(old?.selected, { path: joinFormPath(dropParent, dropIndex) }) }));
    historyRecord?.save();
    console.log(params, '同域拖放');
  };

  const onAdd: ReactSortableProps<any>['onAdd'] = (params) => {
    console.log(params, '跨域拖放');
    const isPanel = params?.item?.dataset?.group == 'panel';
    // 从侧边栏插入进来
    if (isPanel) {
      const fromId = params?.item?.dataset?.type;
      const dropIndex = params?.newIndex;
      const dropParent = dndPath;
      const configItem = getConfigItem(fromId, editorConfig);
      const newItem = configItem?.panel?.nonform ? configItem : Object.assign({ name: defaultGetId(fromId) }, configItem);
      insertWidgetItem(formrender, newItem, dropIndex, dropParent);
      context?.dispatch((old) => ({ ...old, selected: Object.assign(old?.selected, { path: joinFormPath(dropParent, dropIndex) }) }));
    } else {
      const fromParent = getParent(params?.item?.dataset?.path);
      const fromIndex = params?.oldIndex;
      if (typeof fromIndex !== 'number') return;
      const dropIndex = params?.newIndex;
      const dropParent = dndPath;
      moveWidgetItem(formrender, { index: fromIndex, parent: fromParent }, { index: dropIndex, parent: dropParent });
      context?.dispatch((old) => ({ ...old, selected: Object.assign(old?.selected, { path: joinFormPath(dropParent, dropIndex) }) }));
    }
    historyRecord?.save();
  };

  return (
    <ReactSortable
      list={dndList || []}
      setList={setList}
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
      {
        // 处理非node节点
        React.Children.map(children, (child, i) => {
          return React.isValidElement(child) ? child : <div key={i}>{child}</div>;
        })
      }
    </ReactSortable>
  );
};

export default React.forwardRef(BaseDnd);
