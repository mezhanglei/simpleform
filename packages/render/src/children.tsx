import React, { useContext, useEffect, useState } from 'react';
import { FormNodeProps, GenerateParams, CustomUnionType, PropertiesData, CustomRenderType, FormChildrenProps } from './types';
import { Form, joinFormPath, SimpleFormContext } from '@simpleform/form';
import { isEqual } from './utils/object';
import '@simpleform/form/lib/css/main.css';
import { matchExpression } from './utils/utils';
import { useSimpleFormRender } from './hooks';
import { isEmpty, isObject } from './utils/type';
import { CustomCol, CustomRow } from './components';

const defaultComponents = {
  'row': CustomRow,
  'col': CustomCol,
  'Form.Item': Form.Item
};

// 渲染表单children
export default function FormChildren(props: FormChildrenProps) {
  const curFormrender = useSimpleFormRender();
  const { form: curForm } = useContext(SimpleFormContext);
  const {
    uneval,
    components,
    plugins = {},
    onPropertiesChange,
    renderItem,
    renderList,
    inside,
    properties: propsProperties,
    form = curForm,
    formrender = curFormrender,
    options,
    evalPropNames = ['props', 'rules'],
  } = props;

  const [fieldPropsMap, setFieldPropsMap] = useState<Partial<FormNodeProps>>({});
  const [properties, setProperties] = useState<PropertiesData>({});
  formrender.registry(Object.assign({}, defaultComponents, components));
  formrender.addPlugin(plugins);

  // 从SimpleFormRender中订阅更新properties
  useEffect(() => {
    if (!formrender) return;
    formrender.subscribeProperties((newValue, oldValue) => {
      setProperties(newValue);
      if (!isEqual(newValue, oldValue)) {
        onPropertiesChange && onPropertiesChange(newValue, oldValue);
      }
    });
    return () => {
      formrender?.unsubscribeProperties();
    };
  }, [formrender, onPropertiesChange]);

  // 从props中更新properties
  useEffect(() => {
    if (!formrender) return;
    formrender.setProperties(propsProperties);
  }, [propsProperties]);

  // 变化时更新
  useEffect(() => {
    if (!properties) return;
    handleFieldProps();
  }, [properties]);

  // 递归检测对象
  const evalAttr = (val: Object | Array<any>): any => {
    if (val instanceof Array) {
      return val.map((item) => {
        return evalAttr(item);
      });
    } else if (isObject(val)) {
      return Object.fromEntries(
        Object.entries(val || {})?.map(
          ([propsKey, propsItem]) => {
            return [propsKey, evalAttr(propsItem)];
          }
        )
      );
    } else {
      const generateItem = compileExpression(val, uneval);
      return generateItem;
    }
  };

  // 递归遍历处理表单域的字符串表达式并存储解析后的信息
  const handleFieldProps = () => {
    if (!properties) return;
    const fieldPropsMap = {};
    // 遍历处理对象树中的非properties字段
    const deepHandle = (formNode: FormNodeProps, path: string) => {
      for (const propsKey of Object.keys(formNode || {})) {
        if (typeof propsKey === 'string') {
          if (propsKey !== 'properties') {
            // @ts-ignore
            const propsValue = formNode[propsKey];
            let result = propsValue;
            const matchStr = matchExpression(propsValue);
            if (matchStr) {
              result = compileExpression(propsValue, uneval);
            } else if (evalPropNames.includes(propsKey)) {
              result = evalAttr(propsValue);
            }
            const propsPath = joinFormPath(path, propsKey);
            // @ts-ignore
            fieldPropsMap[propsPath] = result;
          } else {
            const childProperties = formNode[propsKey];
            const isList = childProperties instanceof Array;
            if (childProperties) {
              for (const key of Object.keys(childProperties)) {
                // @ts-ignore
                const childField = childProperties[key];
                const childName = isList ? `[${key}]` : key;
                if (typeof childName === 'string') {
                  const childPath = joinFormPath(path, childName) as string;
                  deepHandle(childField, childPath);
                }
              }
            }
          }
        }
      }
    };

    for (const key of Object.keys(properties)) {
      // @ts-ignore
      const childField = properties[key];
      const childName = key;
      if (typeof key === 'string') {
        deepHandle(childField, childName);
      }
    }
    setFieldPropsMap(fieldPropsMap);
  };

  // 获取计算表达式之后的结果
  const getEvalFieldProps = (field: FormNodeProps, path?: string) => {
    if (isEmpty(field)) return;
    return Object.fromEntries(
      Object.entries(field || {})?.map(
        ([propsKey, propsValue]) => {
          const propsPath = joinFormPath(path, propsKey);
          // @ts-ignore
          const generateValue = propsPath && fieldPropsMap[propsPath];
          const matchStr = matchExpression(propsValue);
          // 匹配上表达式或表达式值的映射则返回映射值
          if (matchStr || generateValue !== undefined) {
            if (propsKey === 'valueSetter' || propsKey === 'valueGetter') {
              return [propsKey, generateValue ? generateValue : () => undefined];
            }
            return generateValue == undefined ? [propsKey] : [propsKey, generateValue];
          }
          return [propsKey, propsValue];
        }
      )
    );
  };

  // 值兼容字符串表达式
  const compileExpression = (value?: unknown, uneval?: boolean): any => {
    if (uneval) return value;
    if (typeof value === 'string') {
      const matchStr = matchExpression(value);
      if (matchStr) {
        // 引入变量
        const variable = {
          form: form,
          formrender: formrender,
          formvalues: form && form.getFieldValue() || {},
          ...plugins
        };
        const variableKeys = Object.keys(variable); // 变量名
        const variableValues = Object.values(variable); // 变量
        const target = matchStr?.replace(/\{\{|\}\}/g, '');
        const codeStr = "return " + target;
        // 函数最后一个参数为函数体，前面均为传入的变量名
        const action = new Function(...variableKeys, codeStr);
        const result = action(...variableValues);
        return compileExpression(result, uneval);
      } else {
        return value;
      }
    } else {
      return value;
    }
  };

  // 目标套上其他组件
  const withSide = (children: any, side?: CustomUnionType, render?: CustomRenderType, commonProps?: GenerateParams) => {
    const childs = typeof render === 'function' ? render(Object.assign({ children }, commonProps)) : children;
    const renderSide = side && formrender.createFormElement(side, Object.assign({}, commonProps));
    const childsWithSide = React.isValidElement(renderSide) ? React.cloneElement(renderSide, { children: childs } as Partial<unknown>) : childs;
    const cloneChilds = React.isValidElement(childsWithSide) ? React.cloneElement(childsWithSide, { key: commonProps?.path }) : childsWithSide;
    return cloneChilds;
  };

  // 生成表单项
  const renderChild = (params: GenerateParams) => {
    const { name, path, field, parent } = params;
    if (!field) return;
    const optionsProps = typeof options === 'function' ? options(field) : options;
    const mergeField = Object.assign({}, optionsProps, field, { props: Object.assign({}, optionsProps?.props, field?.props) });
    const {
      readOnlyRender,
      hidden,
      type,
      props,
      typeRender,
      properties,
      footer,
      suffix,
      component,
      inside,
      outside,
      ...restField
    } = mergeField;
    if (hidden === true) return;
    // 是否有子节点
    const haveProperties = isObject(properties) || properties instanceof Array;
    // 当前节点是否为只读
    const isReadOnly = restField?.readOnly === true;
    const commonParams = {
      name,
      path,
      field: mergeField,
      parent,
      form: form,
      formrender: formrender
    }; // 公共参数
    const footerInstance = formrender.createFormElement(footer, commonParams);
    const suffixInstance = formrender.createFormElement(suffix, commonParams);
    const fieldProps = Object.assign({
      name: name,
      footer: footerInstance,
      suffix: suffixInstance,
      component: formrender.getFormComponent(component),
    }, restField);
    let result;
    if (isReadOnly) {
      // 只读节点
      const readOnlyWidget = formrender.createFormElement(readOnlyRender, commonParams);
      result = haveProperties ?
        readOnlyWidget
        :
        <Form.Item {...fieldProps}>
          {readOnlyWidget}
        </Form.Item>;
    } else {
      // 其他表单节点
      const FormNodeWidget = formrender.createFormElement(typeRender || { type, props }, commonParams);
      if (haveProperties) {
        const FormNodeChildren = Object.entries(properties as PropertiesData || {}).map(([key, field], index: number) => {
          const isList = properties instanceof Array;
          const childKey = isList ? `[${key}]` : key;
          const joinPath = joinFormPath(path, childKey);
          const generateField = getEvalFieldProps(field, joinPath);
          const joinName = generateField?.ignore === true ? name : joinFormPath(name, childKey);
          if (generateField) {
            generateField['index'] = index;
          }
          return renderChild({
            name: joinName,
            path: joinPath,
            field: generateField,
            parent: { name, path, field: mergeField }
          });
        }) as any;
        const withSideChildren = withSide(FormNodeChildren, inside, renderList, commonParams);
        result = React.isValidElement(FormNodeWidget) ?
          React.cloneElement(FormNodeWidget, { children: withSideChildren } as Partial<unknown>)
          : withSideChildren;
      } else {
        // 最底层的项携带表单域的节点
        const { onValuesChange, ...restFieldProps } = fieldProps;
        result = (
          <Form.Item
            {...restFieldProps}
            onValuesChange={(...args) => {
              onValuesChange && onValuesChange(...args);
              handleFieldProps();
            }}>
            {({ bindProps }: any) => React.isValidElement(FormNodeWidget) ? React.cloneElement(FormNodeWidget, bindProps) : FormNodeWidget}
          </Form.Item>
        );
      };
    }
    return withSide(result, outside, renderItem, commonParams);
  };

  const isList = properties instanceof Array;
  const childs = Object.entries(properties || {}).map(([key, field], index: number) => {
    const childKey = isList ? `[${key}]` : key;
    const generateField = getEvalFieldProps(field, childKey);
    if (generateField) {
      generateField['index'] = index;
    }
    const joinName = generateField?.ignore === true ? '' : childKey;
    return renderChild({ name: joinName, path: childKey, field: generateField });
  });

  return withSide(childs, inside, renderList, { formrender: formrender, form: form });
}

FormChildren.displayName = 'Form.Children';
