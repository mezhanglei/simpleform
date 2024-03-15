import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import './index.less';
import { getConfigItem, getSelectedIndex, insertFormItem } from '../utils/utils';
import DndSortable from 'react-dragger-sort';
import { FormEditorContextProps, useEditorContext } from '../context';
import { getParent } from '../components/formrender';

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
    <span onClick={onChange} ref={ref} className={cls} style={style} {...restProps}>
      {children}
    </span>
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
    const newIndex = getSelectedIndex(editor, selected) + 1; // 插入位置序号
    const configItem = getConfigItem(key, editorConfig); // 提取默认值
    if (selected?.attributeName) {
      insertFormItem(editor, configItem, newIndex, { path: selected?.path, attributeName: getParent(selected?.attributeName) });
    } else {
      insertFormItem(editor, configItem, newIndex, { path: selected?.parent?.path });
    }
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
                <DndSortable
                  className='elements-list'
                  collection={{ type: 'panel' }}
                  options={{
                    disabledDrop: true,
                    hiddenFrom: false,
                    disabledSort: true
                  }}
                >
                  {
                    list.map((key) => {
                      const data = editorConfig?.[key] || {};
                      const panel = data?.panel || {};
                      return <PanelTag key={key} data-id={key} onChange={() => onChange?.(key)}>{panel.label}</PanelTag>;
                    })
                  }
                </DndSortable>
              </div>
            );
          })
        }
      </div>
  );
};

EditorPanel.displayName = 'editor-panel';
export default EditorPanel;
