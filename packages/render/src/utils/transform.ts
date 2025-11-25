import { deepSet, Form, isValidFormName } from '@simpleform/form';
import React from 'react';
import { cloneElement, createElement, isValidComponent, isValidElement } from './framework';
import { CustomRenderType, FormRenderNodeProps, FormRenderProps, FRContext, ReactComponent } from '../typings';
import { isEmpty, isObject } from './type';

/* eslint-disable */

// 合并表单配置项(浅合并，嵌套属性合并只允许一层深度)
export const mergeFROptions = (
  oldConfig,
  newConfig,
  mergeFunNames: string[] = ['onValuesChange', 'onFieldsMounted', 'onFieldsChange']
) => {
  if (!isObject(newConfig)) return oldConfig;
  const cloneConfig = { ...oldConfig };
  Object.keys(newConfig || {}).forEach((key) => {
    const oldItem = oldConfig?.[key];
    const newItem = newConfig?.[key];
    if (isObject(oldItem) && isObject(newItem) && !isValidElement(oldItem)) {
      cloneConfig[key] = { ...oldItem, ...newItem };
    } else if (typeof oldItem === 'function' && mergeFunNames.includes(key)) {
      cloneConfig[key] = (...args: unknown[]) => {
        oldItem?.(...args);
        return newItem?.(...args);
      };
    } else {
      cloneConfig[key] = newItem;
    }
  });
  return cloneConfig;
};

// 递归遍历转换嵌套对象的子属性
export const traverseMapObject = (val, callback) => {
  const isElement = isValidElement(val);
  if (Array.isArray(val)) {
    return val.map((item) => traverseMapObject(item, callback));
  } else if (isObject(val) && !isElement) {
    const temp = {};
    Object.keys(val || {}).forEach((key) => {
      const item = val[key];
      temp[key] = traverseMapObject(item, callback);
    });
    return temp;
  }
  return typeof callback === 'function' ? callback(val) : val;
};

// 递归遍历widgetList数据结构
export const traverseList = <V>(
  list?: Array<V>,
  callback?: (item: V, index: number, parent?: Array<string | number>) => any | void,
  parent?: Array<string | number>
) => {
  if (!(list instanceof Array)) return;
  return list.map((item, index) => {
    const children = (item as any)?.children;
    const curPath = (parent || []).concat(index);
    callback?.(item, index, curPath);
    if (children instanceof Array) {
      traverseList(children, callback, curPath?.concat('children'));
    }
  });
};

// 递归解析对象或数组中的每个属性
export const traverseParse = <V>(obj: V, variables?: object, parser?: FormRenderProps['parser']) => {
  if (typeof parser !== 'function') return obj;
  return traverseMapObject(obj, (val) => {
    const generateItem = parser(val, variables);
    return generateItem;
  });
};

// 提取widgetList中的默认值
export const getInitialValues = <V>(widgetList?: FormRenderProps['widgetList']) => {
  if (!(widgetList instanceof Array)) return;
  let initialValues = {} as V;
  traverseList(widgetList, (item) => {
    if (item?.initialValue !== undefined && isValidFormName(item?.name)) {
      initialValues = (deepSet(initialValues, item.name, item?.initialValue) || {}) as V;
    }
  });
  return initialValues;
};

// 创建元素
export const createFRElement = (
  target?: any,
  props?: any,
  widgets?: FormRenderProps['components']
): React.ReactNode => {
  if (target instanceof Array) {
    return target.map((item) => createFRElement(item, props, widgets));
  }
  if (target === undefined || target === null || typeof target === 'string' || typeof target === 'number') {
    return target;
  }
  // 判断是否为ReactElment
  if (isValidElement(target)) {
    return cloneElement(target, props as React.Attributes);
  }
  // 是否为组件声明
  if (isValidComponent(target)) {
    return createElement(target as ReactComponent<any>, props);
  }
  // 是否为注册组件
  if (typeof target?.type === 'string' && widgets?.[target?.type]) {
    const Com = widgets?.[target?.type];
    return createElement(Com, Object.assign({}, props, target?.props));
  }
};

// 解析
export const parseFRData = (data, formrender: FormRenderProps['formrender'], form?: FormRenderProps['form']) => {
  const defineConfig = formrender?.config;
  const curForm = form || defineConfig?.form;
  const variables = {
    form: curForm,
    formrender,
    formvalues: curForm?.getFieldValue() || {},
    ...defineConfig?.variables,
  };
  const parseData = traverseParse(data, variables, defineConfig?.parser);
  return parseData;
};

// 目标嵌套其他组件
export const withSide = (
  target?: React.ReactNode,
  customRender?: CustomRenderType,
  side?: React.ReactNode,
  context?: FRContext
) => {
  const childs = typeof customRender === 'function' ? customRender(target, context) : target;
  if (isValidElement(side)) {
    return cloneElement(side, { key: context?._options?.path?.toString() }, childs);
  }
  return childs as React.ReactElement<any, any>;
};

// 渲染节点
export const renderFRNode = (node?: FormRenderNodeProps, formContext?) => {
  if (!node?.formrender) return;
  const { formrender, widget, index, path, onValuesChange, renderItem, renderList } = node;
  if (
    isValidElement(widget) ||
    widget === undefined ||
    widget === null ||
    typeof widget === 'string' ||
    typeof widget === 'number'
  ) {
    return widget;
  }
  const defineConfig = formrender?.config || {};
  const curForm = defineConfig?.form || formContext?.form;
  const customItem = renderItem || defineConfig?.renderItem;
  const customList = renderList || defineConfig?.renderList;
  // 节点信息
  const parseNode = parseFRData(widget, formrender, curForm);
  const defineOptions =
    typeof defineConfig?.options === 'function' ? defineConfig?.options(parseNode) : defineConfig?.options;
  const baseOptions = mergeFROptions(formContext, defineOptions);
  const curData = mergeFROptions(baseOptions, parseNode);
  const { hidden, readOnlyRender, typeRender, type, props, children, inside, outside, ...formItemProps } = curData;
  const frContext = {
    _options: { ...curData, formrender, index, path },
  };
  if (hidden === true) return null;
  const isFormWidget = isValidFormName(formItemProps?.name) ? true : false;
  const readOnlyEle = typeof readOnlyRender === 'function' ? readOnlyRender(frContext) : readOnlyRender;
  const typeRenderEle = typeof typeRender === 'function' ? typeRender(frContext) : typeRender;
  const typeWidget = createFRElement(
    formItemProps?.readOnly === true ? readOnlyEle : typeRenderEle || { type, props },
    frContext,
    defineConfig.components
  );
  const insideEle = createFRElement(inside, frContext, defineConfig?.components);
  const outsideEle = createFRElement(outside, frContext, defineConfig?.components);
  const typeChildren =
    children instanceof Array
      ? renderFRNodeList(formrender, children, formContext, { ...node, path: path?.concat('children') })
      : children;
  // 元素节点
  let curNode;
  if (isValidElement(typeWidget) && !isEmpty(typeChildren)) {
    curNode = cloneElement(typeWidget, {}, withSide(typeChildren, customList, insideEle, frContext));
  } else {
    curNode = isEmpty(typeWidget) ? typeChildren : typeWidget;
  }
  const result = isFormWidget
    ? createElement(
      Form.Item,
      {
        ...formItemProps,
        onValuesChange: (a, b) => {
          onValuesChange?.(a, b);
          return formItemProps?.onValuesChange?.(a, b);
        },
      } as React.Attributes,
      curNode
    )
    : curNode;
  return withSide(result, customItem, outsideEle, frContext);
};

export const renderFRNodeList = (
  formrender: FormRenderNodeProps['formrender'],
  widgetList?,
  formContext?,
  parentNode?: Partial<FormRenderNodeProps>
) => {
  if (!formrender || !(widgetList instanceof Array)) return;
  return widgetList.map((item, index) => {
    const curPath = (parentNode?.path || []).concat(index);
    return renderFRNode(
      {
        ...parentNode,
        formrender,
        widget: item,
        index,
        path: curPath,
      },
      formContext
    );
  });
};

/* eslint-enable */
