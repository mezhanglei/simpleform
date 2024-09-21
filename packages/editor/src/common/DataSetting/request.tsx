import { Input, Select } from "antd";
import classNames from "classnames";
import React, { CSSProperties, useEffect } from "react";
import { EditorCodeMirrorModal } from "../CodeMirror";
import CodeTextArea from "../CodeTextArea";
import FormRender, { useSimpleForm } from "@simpleform/render";
import { CommonFormProps } from "../../typings";

export interface RequestResponseConfig {
  url?: string; // 请求的路径
  method?: string; // 请求方式
  paramsType?: string; // 参数类型
  params?: unknown; // 参数
  headers?: unknown; // headers携带的信息
  returnFn?: string | (<V, R>(val: V) => R); // 解析函数字符串
}

export interface RequestSettingProps extends CommonFormProps<RequestResponseConfig> {
  className?: string;
  style?: CSSProperties;
}

const prefixCls = 'request-source';
const classes = {
  cls: prefixCls
};
const methodOptions = [
  { value: 'get', label: 'GET' },
  { value: 'post', label: 'POST' }
];
const paramsTypeOptions = [
  { value: 'formData', label: 'FormData' },
  { value: 'json', label: 'JSON' }
];

// 请求配置
const RequestSetting = React.forwardRef<HTMLElement, RequestSettingProps>((props, ref) => {

  const {
    value,
    onChange,
    className,
    _options,
    ...rest
  } = props;

  const form = useSimpleForm<RequestResponseConfig>();

  useEffect(() => {
    if (form) {
      form.setFieldsValue(value);
    }
  }, [value]);

  const widgetList = [
    {
      label: '接口',
      name: 'url',
      layout: 'horizontal',
      labelWidth: 80,
      required: true,
      typeRender: () => <Input style={{ width: '100%' }} />,
    },
    {
      label: '请求方式',
      name: 'method',
      layout: 'horizontal',
      labelWidth: 80,
      typeRender: () => <Select style={{ width: '100%' }} options={methodOptions} />,
    },
    {
      label: '提交方式',
      name: 'paramsType',
      layout: 'horizontal',
      labelWidth: 80,
      hidden: "{{formvalues && formvalues.method === 'post'}}",
      typeRender: () => <Select style={{ width: '100%' }} options={paramsTypeOptions} />,
    },
    {
      label: '请求参数',
      name: 'params',
      layout: 'horizontal',
      labelWidth: 80,
      typeRender: () => <EditorCodeMirrorModal />,
    },
    {
      label: 'header信息',
      name: 'headers',
      layout: 'horizontal',
      labelWidth: 80,
      typeRender: () => <EditorCodeMirrorModal />,
    },
    {
      label: '解析函数',
      name: 'returnFn',
      layout: 'horizontal',
      labelWidth: 80,
      initialValue: 'function (res){\n   return res.data;\n}',
      typeRender: () => <CodeTextArea style={{ width: '100%' }} />,
    },
  ];

  const onFieldsChange = (_) => {
    if (!_?.name) return;
    const newConfig = form.getFieldValue();
    onChange && onChange(newConfig);
  };

  return (
    <div className={classNames(classes.cls, className)} {...rest}>
      <FormRender
        tagName="div"
        form={form}
        widgetList={widgetList}
        onFieldsChange={onFieldsChange}
      />
    </div>
  );
});

export default RequestSetting;
