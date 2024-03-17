import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import SvgIcon from "../../SvgIcon";
import './index.less';
import CustomModal from "../../AntdModal";
import classNames from "classnames";
import DefaultFormRender, { Form, useSimpleForm, matchExpression, CommonWidgetProps, CustomWidgetItem } from "../../../formrender";
import { Radio } from "antd";
import ShowSettingModal from "../../LinkageSetting/ShowSettingModal";
import { InputFormRule, InputFormRuleKey } from "..";

export interface RuleCoreRefs {
  showRuleModal: () => void
}

export interface RuleCoreProps extends CommonWidgetProps<any> {
  name?: InputFormRuleKey;
  label?: string;
  setting?: CustomWidgetItem;
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
    setting,
    onChange,
    className,
    widgetItem,
    ...rest
  } = props;

  const [ruleValue, setRuleValue] = useState<InputFormRule>();
  const [selectType, setSelectType] = useState<string>('handle');
  const editRef = useRef<any>();
  const currentForm = useSimpleForm();
  const context = widgetItem?.context;
  const FormRender = context?.state?.FormRender || DefaultFormRender;

  useImperativeHandle(ref, () => ({ showRuleModal: () => editRef.current.click() }));

  const properties = name ? {
    [name]: selectType === 'dynamic' ? {
      label: '联动条件',
      layout: 'horizontal',
      rules: [{ required: true, message: '请输入' }],
      labelWidth: 80,
      typeRender: <ShowSettingModal setting={{ ...setting, label: undefined }} />
    } : {
      ...setting,
      rules: [{ required: true, message: '请输入' }],
      layout: 'horizontal',
      labelWidth: 80,
    },
    message: {
      label: '提示信息',
      layout: 'horizontal',
      rules: [{ required: true, message: '请输入' }],
      labelWidth: 80,
      type: 'Input',
      props: {
      }
    },
  } : undefined;

  useEffect(() => {
    setRuleValue(value);
  }, [value]);

  const selectTypeChange = (e: any) => {
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
      <CustomModal title="校验规则" onOk={handleOk} displayElement={
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
          properties={properties}
        />
      </CustomModal>
    </div>
  );
});

export default RuleCore;
