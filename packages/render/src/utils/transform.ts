import { deepSet, isValidFormName } from "@simpleform/form";
import React from "react";
import {
  cloneElement,
  createElement,
  isValidComponent,
  isValidElement,
} from "./framework";
import {
  FormChildrenProps,
  FormRenderNodeProps,
  FormRenderProps,
  FRGenerateNode,
  ReactComponent,
} from "../typings";
import { isObject } from "./type";

/* eslint-disable */

// 合并表单配置项(浅合并，嵌套属性合并只允许一层深度)
export const mergeFROptions = (
  oldConfig,
  newConfig,
  mergeFunNames: string[] = [
    "onValuesChange",
    "onFieldsMounted",
    "onFieldsChange",
  ]
) => {
  if (!isObject(newConfig)) return oldConfig;
  const cloneConfig = { ...oldConfig };
  Object.keys(newConfig || {}).forEach((key) => {
    const oldItem = oldConfig?.[key];
    const newItem = newConfig?.[key];
    if (isObject(oldItem) && isObject(newItem) && !isValidElement(oldItem)) {
      cloneConfig[key] = { ...oldItem, ...newItem };
    } else if (typeof oldItem === "function" && mergeFunNames.includes(key)) {
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
  return typeof callback === "function" ? callback(val) : val;
};

// 递归遍历widgetList数据结构
export const traverseList = <V>(
  list?: Array<V>,
  callback?: (
    item: V,
    index: number,
    path?: Array<string | number>
  ) => any | void,
  parent?: Array<string | number>
) => {
  if (!(list instanceof Array)) return;
  return list.map((item, index) => {
    const children = (item as any)?.children;
    const curPath = (parent || []).concat(index);
    callback?.(item, index, curPath);
    if (children instanceof Array) {
      traverseList(children, callback, curPath?.concat("children"));
    }
  });
};

// 递归解析对象或数组中的每个属性
export const traverseParse = <V>(
  obj: V,
  variables?: object,
  parser?: FormRenderProps["parser"]
) => {
  if (typeof parser !== "function") return obj;
  return traverseMapObject(obj, (val) => {
    const generateItem = parser(val, variables);
    return generateItem;
  });
};

export const getFRComponent = (
  widget?: ReactComponent<any> | FRGenerateNode,
  components?: FormRenderProps["components"]
) => {
  // 是否为组件声明
  if (isValidComponent(widget)) {
    return [widget];
  }
  const widgetType = widget?.["type"];
  if (isValidComponent(widgetType)) {
    return [widgetType, widget?.["props"]];
  }
  // 是否为注册组件
  if (typeof widgetType === "string" && components?.[widgetType]) {
    return [components?.[widgetType], widget?.["props"]];
  }
  return [];
};

// 提取widgetList中的默认值
export const getInitialValues = (
  widgetList?: FRGenerateNode[],
  code = "initialValue"
) => {
  if (!(widgetList instanceof Array)) return;
  let initialValues = {};
  traverseList(widgetList, (item) => {
    const name = item?.name;
    if (item?.[code] !== undefined && isValidFormName(name)) {
      initialValues = deepSet(initialValues, item.name, item?.[code]) || {};
    }
  });
  return initialValues;
};

// 创建元素
export const createFRElement = (
  Com?: ReactComponent<any> | React.ReactElement,
  ComProps?: any,
  ...children: React.ReactNode[]
): React.ReactNode => {
  if (!Com) {
    return children?.length === 1 ? children[0] : children;
  }
  if (isValidElement(Com)) {
    return cloneElement(Com, ComProps);
  }
  return createElement(Com, ComProps, ...children);
};

// 解析
export const parseFRData = (
  data,
  formrender: FormRenderProps["formrender"],
  form?: FormRenderProps["form"]
) => {
  const defineConfig = formrender?.config;
  const curForm = form || defineConfig?.formConfig?.form;
  const variables = {
    form: curForm,
    formrender,
    ...defineConfig?.variables,
  };
  const parseData = traverseParse(data, variables, defineConfig?.parser);
  return parseData;
};

// 解析节点组件
export const parseWidget = (
  widget: FormRenderNodeProps["widget"] | React.ReactElement,
  formrender: FormRenderNodeProps["formrender"],
  formConfig?: FormChildrenProps["formConfig"]
) => {
  if (!formrender) return;
  if (
    isValidElement(widget) ||
    widget === undefined ||
    widget === null ||
    typeof widget === "string" ||
    typeof widget === "number"
  ) {
    return widget;
  }
  const defineConfig = formrender?.config;
  const curFormConfig = formConfig || defineConfig?.formConfig;
  const curForm = curFormConfig?.form;
  const formContext = curFormConfig?.context;
  // 节点信息
  const parseData = parseFRData(widget, formrender, curForm);
  const defineOptions =
    typeof defineConfig?.options === "function"
      ? defineConfig?.options(parseData)
      : defineConfig?.options;
  const baseOptions = Object.assign({}, defineOptions, formContext);
  const parseResult = mergeFROptions(baseOptions, parseData);
  return parseResult;
};

/* eslint-enable */
