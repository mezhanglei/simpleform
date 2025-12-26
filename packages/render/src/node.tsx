import React from 'react';
import { useFormConfig } from './hooks';
import { FormRenderNodeProps } from './typings';
import { renderFRNode } from './utils';

/* eslint-disable */

// 渲染节点
const FormRenderNode: React.FC<FormRenderNodeProps> = (node) => {
  const formConfig = useFormConfig(node?.formrender?.config?.formConfig);
  return <>{renderFRNode(node, formConfig)}</>
}

export default FormRenderNode

/* eslint-enable */
