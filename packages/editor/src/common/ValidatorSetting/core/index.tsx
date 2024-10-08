import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import './index.less';
import classNames from "classnames";
import {
  CommonFormProps,
  EditorGenerateWidgetItem
} from "../../../typings";
import FormRender, {
  Form,
  useSimpleForm,
  matchExpression,
} from "@simpleform/render";
import { Input, Radio } from "antd";
import { InputFormRuleKey } from "../index";
import ButtonWithRules from "../../RulesSetting/button";
import { CustomModal, SvgIcon } from "../../";

export interface RuleCoreRefs {
  showRuleModal: () => void
}

export type InputFormRule = Record<string, string | boolean> & { message?: string; };

export interface RuleCoreProps extends CommonFormProps<InputFormRule> {
  name?: InputFormRuleKey;
  label?: string;
  widgetConfig?: EditorGenerateWidgetItem;
  className?: string;
}

const prefixCls = 'rules-item-setting';
const classes = {
  item: prefixCls,
  label: `${prefixCls}-label`,
  message: `${prefixCls}-message`,
  edit: `${prefixCls}-edit`,
  icon: `${prefixCls}-icon`,
};

const SelectOptions = [
  { label: '手动设置', value: 'handle' },
  { label: '联动设置', value: 'dynamic' }
];

const RuleCore = React.forwardRef<RuleCoreRefs, RuleCoreProps>((props, ref) => {

  const {
    name,
    value,
    label,
    widgetConfig,
    onChange,
    className,
  } = props;

  const [ruleValue, setRuleValue] = useState<InputFormRule>();
  const [selectType, setSelectType] = useState<string>('handle');
  const editRef = useRef<HTMLSpanElement>(null);
  const currentForm = useSimpleForm<InputFormRule>();

  useImperativeHandle(ref, () => ({ showRuleModal: () => editRef.current?.click() }));

  const widgetList = name ? [
    selectType === 'dynamic' ? {
      label: '联动条件',
      name: name,
      layout: 'horizontal',
      rules: [{ required: true, message: '请输入' }],
      labelWidth: 80,
      typeRender: () => <ButtonWithRules widgetConfig={{ ...widgetConfig, label: undefined }} />
    } : {
      ...widgetConfig,
      name: name,
      rules: [{ required: true, message: '请输入' }],
      layout: 'horizontal',
      labelWidth: 80,
    },
    {
      label: '提示信息',
      name: 'message',
      layout: 'horizontal',
      rules: [{ required: true, message: '请输入' }],
      labelWidth: 80,
      typeRender: () => <Input />,
    },
  ] : undefined;

  useEffect(() => {
    setRuleValue(value);
  }, [value]);

  const selectTypeChange = (e) => {
    setSelectType(e.target.value);
  };

  // 给弹窗的表单赋值
  const setRuleModal = (data?: InputFormRule) => {
    if (name && data?.[name] !== undefined) {
      currentForm.setFieldsValue(data);
      if (matchExpression(data[name])) {
        setSelectType('dynamic');
      } else {
        setSelectType('handle');
      }
    } else {
      currentForm.setFieldsValue({});
      setSelectType('handle');
    }
  };

  const clickEdit = (showModal: () => void) => {
    showModal();
    setRuleModal(ruleValue);
  };

  const handleOk = async (closeModal: () => void) => {
    const { error, values } = await currentForm.validate();
    if (error) return;
    setRuleValue(values);
    onChange && onChange(values);
    closeModal();
  };

  const clearValue = () => {
    setRuleValue(undefined);
    onChange && onChange();
  };

  const cls = classNames(classes.item, className);

  return (
    <div className={cls}>
      <CustomModal
        modalProps={{
          title: "校验规则",
          destroyOnClose: false
        }}
        onOk={handleOk}
        displayElement={
          (showModal) => (
            <div className={classes.label}>
              <label className={classes.edit}>
                {label}
              </label>
              <span ref={editRef} onClick={() => clickEdit(showModal)}>
                <SvgIcon className={classes.icon} title="编辑" name="edit" />
              </span>
              {name && ruleValue && <SvgIcon className={classes.icon} onClick={clearValue} title="清除" name="qingchu" />}
            </div>
          )
        }>
        <Form.Item labelWidth="80" layout='horizontal' label="设置类型">
          <Radio.Group
            options={SelectOptions}
            onChange={selectTypeChange}
            value={selectType}
          />
        </Form.Item>
        <FormRender
          tagName="div"
          form={currentForm}
          widgetList={widgetList}
        />
      </CustomModal>
    </div>
  );
});

export default RuleCore;
