import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import { message } from 'antd';
import './index.less';
import SvgIcon from '../components/common/SvgIcon';
import { CustomFormNodeProps } from '../components/formrender';
import { getConfigItem, getSelectedIndex, insertFormItem } from '../utils/utils';
import DndSortable from 'react-dragger-sort';
import { useEditorContext } from '../context';

export interface TagProps {
  className?: string
  style?: CSSProperties
  children: any
  onChange: () => void
  icon?: string;
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
    "ColorPicker",
    "Cascader",
    "FileUpload",
    "ImageUpload",
    "RichEditor",
    "RichText",
  ]
};

const Tag = React.forwardRef((props: TagProps, ref: any) => {
  const {
    style,
    className,
    children,
    onChange,
    icon,
    ...restProps
  } = props;
  const prefixCls = 'component-tag';
  const cls = classnames(prefixCls, className);

  return (
    <span onClick={onChange} ref={ref} className={cls} style={style} {...restProps}>
      <div className={`${prefixCls}-icon`}>
        {icon && <SvgIcon name={icon} />}
      </div>
      {children}
    </span>
  );
});

export interface EditorPanelProps {
  className?: string
  style?: CSSProperties
}

const prefixCls = `simple-form-panel`;
function EditorPanel(props: EditorPanelProps, ref: any) {
  const {
    style,
    className,
  } = props;

  const context = useEditorContext();
  const { selected, editor, editorConfig, panelData, historyRecord } = context.state;
  const selectedParent = selected?.parent;
  const attributeName = selected?.attributeName;
  const cls = classnames(prefixCls, className);

  const onChange = (key: string, item: CustomFormNodeProps) => {
    if (attributeName) return;
    const newIndex = getSelectedIndex(editor, selected) + 1; // 插入位置序号
    const configItem = getConfigItem(key, editorConfig); // 提取默认值
    insertFormItem(editor, configItem, newIndex, { path: selectedParent?.path });
    historyRecord?.save();
  };

  return (
    <div ref={ref} className={cls} style={style}>
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
                    return <Tag key={key} data-id={key} icon={panel?.icon} onChange={() => onChange?.(key, data)}>{panel.label}</Tag>;
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
export default React.forwardRef(EditorPanel);
