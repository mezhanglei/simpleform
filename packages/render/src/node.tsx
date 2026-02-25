import { isValidFormName } from '@simpleform/form';
import React, { useEffect, useState } from 'react';
import { useFormConfig } from './hooks';
import { FormRenderNodeProps, FRGenerateNode } from './typings';
import { createFRElement, getFRComponent, isEmpty, isValidElement, parseWidget, } from './utils';
import fastDeepEqual from 'fast-deep-equal';
import { stringify } from 'flatted';

/* eslint-disable */

// 渲染节点
const FormRenderNode: React.FC<FormRenderNodeProps> = (params) => {
  const { formrender, widget, index, path, onValuesChange } = params;
  const defineConfig = formrender?.config;
  const formConfig = useFormConfig(defineConfig?.formConfig);
  const [parseData, setParseData] = useState<FRGenerateNode>({});
  const newData = parseWidget(widget, formrender, formConfig) || {};

  useEffect(() => {
    const prevData = parseData
    if (!fastDeepEqual(prevData, newData)) {
      setParseData(newData)
    }
  }, [stringify(newData)]);

  const FormItem = formConfig?.Item;
  const { hidden, readOnlyRender, typeRender, type, props, children, inside, outside, ...formItemProps } = parseData;
  const mergeCtx = (params?) => ({
    key: path?.toString(),
    _options: { ...parseData, formrender, index, path },
    ...params,
  });
  if (hidden === true) return null;
  const isFormWidget = isValidFormName(formItemProps?.name) ? true : false;
  const [insideCom, insideProps] = getFRComponent(inside, defineConfig?.components);
  const [outsideCom, outsideProps] = getFRComponent(outside, defineConfig?.components);
  const [widgetCom, widgetProps] = getFRComponent({ type, props }, defineConfig?.components);
  const typeRenderEle = typeof typeRender === 'function' ? typeRender(mergeCtx()) : typeRender;
  const nestChildren = children instanceof Array ? children : [children];
  const childs = !isEmpty(children)
    ? createFRElement(
      insideCom,
      mergeCtx(insideProps),
      nestChildren.map((child, childIndex) => {
        const curPath = path?.concat('children')?.concat(childIndex);
        if (
          isValidElement(child) ||
          child === undefined ||
          child === null ||
          typeof child === 'string' ||
          typeof child === 'number'
        ) {
          return child;
        }
        return <FormRenderNode key={curPath?.toString()} {...params} widget={child} index={childIndex} path={curPath} />;
      })
    )
    : undefined;
  const readonlyEle = typeof readOnlyRender === 'function' ? readOnlyRender(mergeCtx()) : readOnlyRender;
  const curNode = formItemProps?.readOnly === true
    ? readonlyEle
    : createFRElement(!isEmpty(typeRender) ? typeRenderEle : widgetCom, mergeCtx(widgetProps), childs);
  if (isFormWidget && FormItem) {
    return <>
      {
        createFRElement(
          outsideCom,
          mergeCtx(outsideProps),
          createFRElement(
            FormItem,
            mergeCtx({
              ...formItemProps,
              onValuesChange: (...args) => {
                onValuesChange?.(...args);
                return formItemProps?.onValuesChange?.(...args);
              },
            }),
            curNode
          )
        )
      }
    </>;
  } else {
    return <>{createFRElement(outsideCom, mergeCtx(outsideProps), curNode)}</>;
  }
};

export default FormRenderNode

/* eslint-enable */
