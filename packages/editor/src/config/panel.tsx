import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import { message } from 'antd';
import './panel.less';
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
  const { selected, editor, editorConfig } = context.state;
  const selectedParent = selected?.parent;
  const attributeName = selected?.attributeName;
  const cls = classnames(prefixCls, className);

  const onChange = (key: string, item: CustomFormNodeProps) => {
    if (attributeName) return;
    const newIndex = getSelectedIndex(editor, selected) + 1; // 插入位置序号
    const initialField = getConfigItem(key, editorConfig.widgets, editorConfig.settings); // 提取默认值
    const panel = selectedParent?.field?.panel;
    const includesIds = panel?.includes;
    if (includesIds && !includesIds.includes(key)) {
      message.warning("当前不可插入");
      return;
    };
    insertFormItem(editor, initialField, newIndex, { path: selectedParent?.path });
  };

  return (
    <div ref={ref} className={cls} style={style}>
      {
        Object.entries(editorConfig.panel).map(([title, list]) => {
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
                    const data = editorConfig.widgets?.[key] || {};
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
