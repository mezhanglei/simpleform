import React from 'react';
import { FormRenderProps } from './typings';
import FormChildren from './children';
import { useFormConfig } from './hooks';

// 渲染表单
export default function FormRender(props: FormRenderProps) {

  const {
    formrender,
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
    formConfig = formrender?.config?.formConfig,
    ...formOptions
  } = props;

  const propFormConfig = formOptions?.form ? { form: formOptions?.form, ...formConfig } : formConfig;
  const curFormConfig = useFormConfig(propFormConfig);
  const curForm = curFormConfig?.form;
  const FormCom = curFormConfig?.Form;

  return (
    <FormCom {...formOptions} form={curForm} >
      <FormChildren
        formConfig={curFormConfig}
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
    </FormCom>
  );
}
