import React, { useEffect, useState } from "react";
import './modal.less';
import SvgIcon from "../SvgIcon";
import DefaultFormRender, { useSimpleForm, CommonFormProps, CustomGenerateWidgetItem } from "../../../formrender";
import { codeToRule, ruleToCodeStr } from "./utils";
import CustomModal, { CustomModalProps } from "../AntdModal";

// 规则条件的渲染数据类型
export type RuleSettingItem = unknown[] | '||' | '&&' | '';
export interface SettingModalProps extends CustomModalProps, CommonFormProps<string> {
  title?: NonNullable<CustomModalProps['modalProps']>['title']
  widgetConfig?: CustomGenerateWidgetItem;
}

const prefixCls = 'dynamic-rules';
const classes = {
  cls: `${prefixCls}`,
  item: `${prefixCls}-item`,
  row: `${prefixCls}-item-row`,
  assemble: `${prefixCls}-item-assemble`,
  itemPrefix: `${prefixCls}-item-prefix`,
  itemSuffix: `${prefixCls}-item-suffix`,
  icon: `${prefixCls}-item-icon`,
};

const assembleOptions = [{
  label: '或',
  value: '||'
}];

/**
 * 联动规则设置弹窗
 */
const LinkageSettingModal: React.FC<SettingModalProps> = (props) => {

  const {
    value,
    onChange,
    widgetConfig,
    title,
    displayElement,
    _options
  } = props;

  const context = _options?.context;
  const FormRender = context?.state?.FormRender || DefaultFormRender;
  const form = useSimpleForm();
  const [dataSource, setDataSource] = useState<Array<RuleSettingItem>>([]);

  useEffect(() => {
    const currentValue = typeof value === 'string' ? value : undefined;
    const ruleData = codeToRule(currentValue);
    const options = ruleData.length ? ruleData : [[]];
    setDataSource(options);
    form.setFieldsValue(options);
  }, [value]);

  const widgetList = dataSource.map((item, index) => {
    if (item instanceof Array) {
      return {
        type: 'row',
        props: {
          gutter: 8,
          className: classes.row,
          align: "middle"
        },
        children: [
          {
            outside: { type: 'col', props: { span: 1 } },
            typeRender: <span className={classes.itemPrefix}>当</span>
          },
          {
            outside: { type: 'col', props: { span: 8 } },
            compact: true,
            name: `[${index}][0]`,
            type: "Input.TextArea",
            props: {
              placeholder: "formvalues['表单字段'] == 值",
            }
          },
          {
            outside: { type: 'col', props: { span: 5 } },
            typeRender: <span className={classes.itemSuffix}>时，设置为</span>
          },
          {
            outside: { type: 'col', props: { span: 5 } },
            name: `[${index}][1]`,
            compact: true,
            ...widgetConfig
          },
          {
            outside: { type: 'col', props: { span: 5 } },
            typeRender: index === 0 ?
              <SvgIcon name="add" className={classes.icon} onClick={() => addNewItem()} />
              :
              <SvgIcon name="delete" className={classes.icon} onClick={() => deleteItem(index)} />
          }
        ]
      };
    } else {
      return {
        name: `[${index}]`,
        compact: true,
        hidden: index === 0,
        type: 'Select',
        props: {
          className: classes.assemble,
          options: assembleOptions
        }
      };
    }
  });

  const addNewItem = () => {
    const newDataSource = dataSource.concat(['||', []]);
    form.setFieldsValue(newDataSource);
    setDataSource(newDataSource);
  };

  const deleteItem = (index: number) => {
    const oldData = [...dataSource];
    if (!oldData) return;
    const newData = [...oldData];
    newData.splice(index - 1, 2);
    form.setFieldsValue(newData);
    setDataSource(newData);
  };

  const onFieldsChange = (_, values) => {
    setDataSource(values);
  };

  const handleOk = (closeModal: () => void) => {
    closeModal();
    const codeStr = ruleToCodeStr(dataSource);
    onChange && onChange(codeStr);
  };


  return (
    <CustomModal
      onOk={handleOk}
      displayElement={displayElement}
      modalProps={{
        className: classes.cls,
        title: title,
        destroyOnClose: false
      }}>
      <FormRender
        tagName="div"
        form={form}
        widgetList={widgetList}
        onFieldsChange={onFieldsChange}
      />
    </CustomModal>
  );
};

export default LinkageSettingModal;
