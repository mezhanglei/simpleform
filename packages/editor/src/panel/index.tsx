import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import './index.less';
import { defaultGetId, getConfigItem, getListIndex, insertWidgetItem } from '../utils/utils';
import { ReactSortable } from "react-sortablejs";
import { FormEditorContextProps, useEditorContext } from '../context';
import { getParent } from '../components/formrender';
import { Tag } from 'antd';

export interface PanelTagProps {
  className?: string
  style?: CSSProperties
  children: any
  onChange: () => void
}

const defaultPanelData = {
  '布局组件': ['Grid', 'Divider', 'Alert'],
  '控件组合': ['FormTable'],
  '基础控件': [
    "Input",
    "Radio.Group",
    "Checkbox.Group",
    "Select",
    "Switch",
    "TimePicker",
    "TimePicker.RangePicker",
    "DatePicker",
    "DatePicker.RangePicker",
    "Slider",
    "Rate",
    "Cascader",
    "FileUpload",
    "ImageUpload",
    "RichEditor",
    "RichText",
  ]
};

const PanelTag = React.forwardRef((props: PanelTagProps, ref: any) => {
  const {
    style,
    className,
    children,
    onChange,
    ...restProps
  } = props;
  const prefixCls = 'component-tag';
  const cls = classnames(prefixCls, className);

  return (
    <Tag onClick={onChange} ref={ref} className={cls} style={style} {...restProps}>{children}</Tag>
  );
});

export interface EditorPanelProps {
  className?: string
  style?: CSSProperties
  panelData?: { [title: string]: Array<string> }; // 组件面板配置
  children?: (context: FormEditorContextProps) => React.ReactElement;
}

const prefixCls = `simple-form-panel`;
function EditorPanel(props: EditorPanelProps) {
  const {
    style,
    className,
    panelData,
    children
  } = props;

  const context = useEditorContext();
  const { selected, editor, editorConfig, historyRecord } = context.state;
  const cls = classnames(prefixCls, className);

  const onChange = (key: string) => {
    const newIndex = getListIndex(editor, selected?.path) + 1; // 插入位置序号
    const configItem = getConfigItem(key, editorConfig); // 提取默认值
    const newItem = configItem?.panel?.nonform ? configItem : Object.assign({ name: defaultGetId(configItem?.type) }, configItem);
    insertWidgetItem(editor, newItem, newIndex, getParent(selected?.path));
    historyRecord?.save();
  };

  return (
    typeof children == 'function' ?
      children(context)
      :
      <div className={cls} style={style}>
        {
          Object.entries(panelData || defaultPanelData).map(([title, list]) => {
            return (
              <div key={title} className='panel-list'>
                <div className={`panel-list-title`}>{title}</div>
                <ReactSortable
                  list={list}
                  setList={() => { }}
                  forceFallback={true}
                  sort={false}
                  className='elements-list'
                  animation={200}
                  group={{
                    name: "panel",
                    pull: "clone",
                    put: false,
                  }}
                >
                  {
                    list.map((key) => {
                      const data = editorConfig?.[key] || {};
                      const panel = data?.panel || {};
                      return <PanelTag key={key} data-type='panel' onChange={() => onChange?.(key)}>{panel.label}</PanelTag>;
                    })
                  }
                </ReactSortable>
              </div>
            );
          })
        }
      </div>
  );
};

EditorPanel.displayName = 'editor-panel';
export default EditorPanel;
