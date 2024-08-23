import React from 'react';
import { FormRenderProps } from './typings';
import { Form, useSimpleForm } from '@simpleform/form';
import FormChildren from './children';

// 渲染表单
export default function FormRender(props: FormRenderProps) {
  const curForm = useSimpleForm();
  const {
    formrender,
    form = curForm,
    parser,
    wrapper,
    widgetList,
    components,
    plugins,
    variables,
    renderItem,
    renderList,
    onRenderChange,
    options,
    ...formOptions
  } = props;

  return (
    <Form form={form} {...formOptions}>
      <FormChildren
        wrapper={wrapper}
        options={options}
        parser={parser}
        formrender={formrender}
        widgetList={widgetList}
        components={components}
        plugins={plugins}
        variables={variables}
        renderItem={renderItem}
        renderList={renderList}
        onRenderChange={onRenderChange}
      />
    </Form>
  );
}
