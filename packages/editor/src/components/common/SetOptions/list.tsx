import { Button } from "antd";
import React, { useEffect, useState } from "react";
import './list.less';
import SvgIcon from "../SvgIcon";
import DefaultFormRender, { CommonFormProps, useSimpleForm } from "../../../formrender";

interface OptionItem { label?: string, value?: string }
export interface OptionListProps extends CommonFormProps<Array<OptionItem>> {
}

const prefixCls = 'options-list';
const classes = {
  item: `${prefixCls}-item`
};

/**
 * 列表
 */
const OptionList = React.forwardRef<HTMLDivElement, OptionListProps>((props, ref) => {

  const {
    value,
    onChange,
    _options
  } = props;
  const context = _options?.context;
  const FormRender = context?.state?.FormRender || DefaultFormRender;
  const intialValue = [{ label: '', value: '' }];
  const [dataSource, setDataSource] = useState<Array<OptionItem>>([]);
  const form = useSimpleForm<Array<OptionItem>>();

  useEffect(() => {
    const options = value instanceof Array ? value : [...intialValue];
    setDataSource(options);
    form.setFieldsValue(options);
  }, [value]);

  const widgetList = dataSource.map((item, index) => ({
    type: 'row',
    props: {
      gutter: 12,
      align: 'middle',
      className: classes.item
    },
    children: [
      {
        name: `[${index}]label`,
        compact: true,
        outside: { type: 'col', props: { span: 10 } },
        rules: [{ required: true }],
        type: 'Input',
        props: {
          placeholder: 'label',
          style: { width: '100%' }
        }
      },
      {
        name: `[${index}]value`,
        compact: true,
        outside: { type: 'col', props: { span: 10 } },
        rules: [{ required: true }],
        type: 'Input',
        props: {
          placeholder: 'value',
          style: { width: '100%' }
        }
      },
      {
        outside: { type: 'col', props: { span: 4 } },
        typeRender: <SvgIcon name="delete" className="icon-delete" onClick={() => deleteItem(index)} />
      },
    ]
  }));

  const deleteItem = (index: number) => {
    const oldData = [...dataSource];
    if (!oldData) return;
    const newData = [...oldData];
    newData.splice(index, 1);
    setDataSource(newData);
    form.setFieldsValue(newData);
    onChange && onChange(newData);
  };

  const addItem = async () => {
    const { error } = await form.validate();
    if (error) {
      return;
    }
    const newData = dataSource.concat(intialValue);
    form.setFieldsValue(newData);
    setDataSource(newData);
  };

  const onFieldsChange = (_, values) => {
    setDataSource(values);
    onChange && onChange(values);
  };

  return (
    <div ref={ref}>
      <FormRender
        tagName="div"
        form={form}
        widgetList={widgetList}
        onFieldsChange={onFieldsChange}
      />
      <Button type="link" onClick={addItem}>
        添加选项
      </Button>
    </div>
  );
});

export default OptionList;
