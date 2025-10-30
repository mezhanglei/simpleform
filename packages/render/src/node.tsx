import React, { useContext } from 'react';
import { FormRenderNodeProps } from './typings';
import { renderFRNode } from './utils';
import { SimpleFormContext } from '@simpleform/form';

/* eslint-disable */

// 渲染节点
const FormRenderNode: React.FC<FormRenderNodeProps> = (node) => {
  const formContext = useContext(SimpleFormContext)
  return <>{renderFRNode(node, formContext)}</>
}

export default FormRenderNode

/* eslint-enable */
