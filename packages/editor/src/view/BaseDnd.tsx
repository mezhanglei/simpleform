import { ReactSortable, ReactSortableProps } from "react-sortablejs";
import React, { CSSProperties } from 'react';
import { getConfigItem, insertWidgetItem, moveWidgetItem } from '../utils';
import { CommonFormProps } from '../typings';
import { getParent, joinFormPath, } from '@simpleform/render';
import './BaseDnd.less';

export interface ControlDndProps extends CommonFormProps, Omit<Partial<ReactSortableProps<any>>, 'onChange'> {
  className?: string;
  style?: CSSProperties;
  dndPath?: string;
  dndList?: Array<unknown>;
}

// 控件的拖放区域组件
const BaseDnd = React.forwardRef<ReactSortable<any>, ControlDndProps>((props, ref) => {
  const { children, _options, dndPath, dndList = [], setList = () => { }, ...rest } = props;
  const editorContext = _options?.editorContext;
  const formrender = _options?.formrender;
  const { editorConfig, historyRecord } = editorContext?.state || {};

  const onUpdate: ControlDndProps['onUpdate'] = (params) => {
    const newIndex = params?.oldIndex;
    if (typeof newIndex !== 'number') return;
    const dropIndex = params?.newIndex;
    const dropParent = dndPath;
    moveWidgetItem(formrender, { index: newIndex, parent: dropParent }, { index: dropIndex, parent: dropParent });
    editorContext?.dispatch((old) => ({ ...old, selected: Object.assign(old?.selected, { path: joinFormPath(dropParent, dropIndex) }) }));
    historyRecord?.save();
    console.log(params, '同域拖放');
  };

  const onAdd: ControlDndProps['onAdd'] = (params) => {
    console.log(params, '跨域拖放');
    const from = params?.item;
    const isPanel = from?.dataset?.group === 'panel';
    // 从侧边栏插入进来
    if (isPanel) {
      const fromType = from?.dataset?.type;
      const dropIndex = params?.newIndex;
      const dropParent = dndPath;
      const configItem = getConfigItem(fromType, editorConfig);
      insertWidgetItem(formrender, configItem, dropIndex, dropParent);
      editorContext?.dispatch((old) => ({ ...old, selected: Object.assign(old?.selected, { path: joinFormPath(dropParent, dropIndex) }) }));
    } else {
      const fromPath = from?.dataset?.path;
      if (!fromPath) {
        console.error('未设置data-path属性');
        return;
      }
      const fromParent = getParent(fromPath);
      const fromIndex = params?.oldIndex;
      if (typeof fromIndex !== 'number') return;
      const dropIndex = params?.newIndex;
      const dropParent = dndPath;
      moveWidgetItem(formrender, { index: fromIndex, parent: fromParent }, { index: dropIndex, parent: dropParent });
      editorContext?.dispatch((old) => ({ ...old, selected: Object.assign(old?.selected, { path: joinFormPath(dropParent, dropIndex) }) }));
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
});

export default BaseDnd;
