import React, { CSSProperties, useEffect, useMemo } from 'react';
import classnames from 'classnames';
import { CustomFormRenderProps, Form, FormChildren, joinFormPath, useSimpleForm } from '../formrender';
import { getWidgetItem, setWidgetItem } from '../utils/utils';
import './component.less';
import CustomCollapse from '../components/common/Collapse';
import { useEditorContext } from '../context';

export interface SelectedSettingProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = 'item-setting';

// 选中节点的属性设置
const SelectedSetting = React.forwardRef<HTMLDivElement, SelectedSettingProps>((props, ref) => {
  const {
    style,
    className,
  } = props;

  const context = useEditorContext();
  const { selected, editor, editorForm, editorConfig } = context?.state || {};
  const selectedPath = selected?.path;
  const form = useSimpleForm();
  const cls = classnames(prefixCls, className);
  const configSetting = useMemo(() => {
    if (!selected) return;
    const selectedItem = getWidgetItem(editor, selected?.path);
    const configSetting = editorConfig?.[selectedItem?.type || '']?.setting;
    const setting = selectedItem?.setting;
    return setting || configSetting;
  }, [editor, selectedPath, editorConfig]);

  useEffect(() => {
    context?.dispatch((old) => ({ ...old, settingForm: form }));
  }, []);

  useEffect(() => {
    // 切换时需要重置后再进行表单设置
    form && form.reset();
    setTimeout(() => {
      if (!form) return;
      const item = getWidgetItem(editor, selected?.path);
      form.setFieldsValue(item);
    }, 50);
  }, [selectedPath]);

  const onFieldsChange: CustomFormRenderProps['onFieldsChange'] = ({ name, value }) => {
    const curPath = joinFormPath(selectedPath, name);
    setWidgetItem(editor, value, curPath);
    // 同步编辑区域初始值展示
    if (name === 'initialValue') {
      const item = getWidgetItem(editor, selectedPath);
      editorForm?.setFieldValue(item?.name || '', value);
    }
  };

  const renderCommonList = () => {
    if (!configSetting) return;
    return (
      Object.entries(configSetting)?.map(([name, data]) => {
        return (
          <CustomCollapse header={name} key={name} isOpened>
            <FormChildren widgetList={data} options={{ context: context }} />
          </CustomCollapse>
        );
      })
    );
  };

  return (
    <div ref={ref} className={cls} style={style}>
      <Form layout="vertical" form={form} onFieldsChange={onFieldsChange}>
        {renderCommonList()}
      </Form>
    </div>
  );
});

SelectedSetting.displayName = 'component-setting';
export default SelectedSetting;
