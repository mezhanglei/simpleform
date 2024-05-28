import React, { useEffect, useState } from 'react';
import FormRender, { CustomFormRenderProps, useSimpleForm } from './FormRender';
import { Button } from 'antd';

const OptionList = React.forwardRef<HTMLElement, any>((props, ref) => {

  const intialValue = [{ label: '', value: '' }];
  const [dataSource, setDataSource] = useState<Array<any>>([]);
  const form = useSimpleForm();

  useEffect(() => {
    const options = [...intialValue];
    setDataSource(options);
    form.setFieldsValue(options);
  }, []);

  const deleteItem = (index: number) => {
    const oldData = [...dataSource];
    if (!oldData) return;
    const newData = [...oldData];
    newData.splice(index, 1);
    setDataSource(newData);
    form.setFieldsValue(newData);
  };

  const addItem = async () => {
    const { error } = await form.validate() || {};
    if (error) {
      return;
    }
    const newData = dataSource.concat(intialValue);
    form.setFieldsValue(newData);
    setDataSource(newData);
  };

  const onFieldsChange: CustomFormRenderProps['onFieldsChange'] = (_, values) => {
    setDataSource(values);
  };

  const widgetList = dataSource.map((item, index) => ({
    type: 'row',
    props: {
      gutter: 12,
      align: 'middle',
      style: { marginBottom: '10px' }
    },
    children: [
      {
        name: `[${index}]label`,
        compact: true,
        outside: { type: 'col', props: { span: 9 } },
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
        outside: { type: 'col', props: { span: 9 } },
        rules: [{ required: true }],
        type: 'Input',
        props: {
          placeholder: 'value',
          style: { width: '100%' }
        }
      },
      {
        outside: { type: 'col', props: { span: 6 } },
        typeRender: <Button type="link" onClick={() => deleteItem(index)}>delete</Button>
      },
    ]
  }));

  return (
    <div>
      <FormRender
        form={form}
        widgetList={widgetList}
        onFieldsChange={onFieldsChange}
      />
      <Button type="link" onClick={addItem}>
        add
      </Button>
    </div>
  );
});

export default OptionList;
