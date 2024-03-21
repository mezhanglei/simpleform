import React, { CSSProperties, useEffect, useMemo } from 'react';
import classnames from 'classnames';
import { CustomFormRenderProps, Form, FormChildren, joinFormPath, useSimpleForm } from '../components/formrender';
import { asyncSettingForm, getWidgetItem, setWidgetItem } from '../utils/utils';
import './component.less';
import CustomCollapse from '../components/common/Collapse';
import { useEditorContext } from '../context';

export interface SelectedSettingProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = 'item-setting';

// 选中节点的属性设置
function SelectedSetting(props: SelectedSettingProps, ref: any) {
  const {
    style,
    className,
  } = props;

  const context = useEditorContext();
  const { selected, editor, editorConfig } = context?.state || {};
  const selectedPath = selected?.path;
  const form = useSimpleForm();
  const cls = classnames(prefixCls, className);
  const configSetting = useMemo(() => {
    if (!selected) return;
    const selectedItem = getWidgetItem(editor, selected?.path);
    const configSetting = editorConfig?.[selectedItem?.type || '']?.setting;
    const setting = selected?.setting;
    return setting || configSetting;
  }, [editor, selectedPath, editorConfig]);

  useEffect(() => {
    context?.dispatch((old) => ({ ...old, settingForm: form }));
  }, []);

  useEffect(() => {
    // 切换时需要重置后再进行表单设置
    setTimeout(() => {
      asyncSettingForm(editor, form, selected);
    }, 50);
    return () => {
      form && form.reset();
    };
  }, [selectedPath]);

  const onFieldsChange: CustomFormRenderProps['onFieldsChange'] = ({ name, value }) => {
    const curPath = joinFormPath(selectedPath, name);
    setWidgetItem(editor, value, curPath);
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
};

SelectedSetting.displayName = 'component-setting';
export default React.forwardRef(SelectedSetting);
