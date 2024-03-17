import React from 'react';
import { FormRenderProps } from './types';
import { Form, useSimpleForm } from '@simpleform/form';
import FormChildren from './children';

// 渲染表单
export default function FormRender(props: FormRenderProps) {
  const curForm = useSimpleForm();
  const {
    formrender,
    form = curForm,
    uneval,
    widgetList,
    components,
    plugins,
    renderItem,
    renderList,
    inside,
    onRenderChange,
    options,
    ...formOptions
  } = props;

  return (
    <Form form={form} {...formOptions}>
      <FormChildren
        options={options}
        uneval={uneval}
        form={form}
        formrender={formrender}
        widgetList={widgetList}
        components={components}
        plugins={plugins}
        renderItem={renderItem}
        renderList={renderList}
        inside={inside}
        onRenderChange={onRenderChange}
      />
    </Form>
  );
}
