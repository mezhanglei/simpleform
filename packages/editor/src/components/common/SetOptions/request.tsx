import classNames from "classnames";
import React, { CSSProperties, useEffect } from "react";
import CodeTextArea from "../CodeTextarea";
import { EditorCodeMirrorModal } from "../CodeMirror";
import DefaultFormRender, { useSimpleForm, FormRenderProps, CommonWidgetProps } from "../../../formrender";

export interface RequestResponseConfig {
  url?: string; // 请求的路径
  method?: string; // 请求方式
  paramsType?: string; // 参数类型
  params?: any; // 参数
  headers?: any; // headers携带的信息
  returnFn?: string | ((val: any) => any); // 解析函数字符串
}

export interface RequestSettingProps extends CommonWidgetProps<RequestResponseConfig> {
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
    widgetItem,
    ...rest
  } = props;

  const context = widgetItem?.context;
  const FormRender = context?.state?.FormRender || DefaultFormRender;
  const requestForm = useSimpleForm();

  useEffect(() => {
    if (requestForm) {
      requestForm.setFieldsValue(value);
    }
  }, [value]);

  const widgetList = [
    {
      label: '接口',
      name: 'url',
      layout: 'horizontal',
      labelWidth: 80,
      required: true,
      type: 'Input',
      props: {
        style: { width: '100%' },
      }
    },
    {
      label: '请求方式',
      name: 'method',
      layout: 'horizontal',
      labelWidth: 80,
      type: 'Select',
      props: {
        style: { width: '100%' },
        options: methodOptions
      }
    },
    {
      label: '提交方式',
      name: 'paramsType',
      layout: 'horizontal',
      labelWidth: 80,
      hidden: "{{formvalues && formvalues.method === 'post'}}",
      type: 'Select',
      props: {
        style: { width: '100%' },
        options: paramsTypeOptions
      }
    },
    {
      label: '请求参数',
      name: 'params',
      layout: 'horizontal',
      labelWidth: 80,
      typeRender: <EditorCodeMirrorModal />,
    },
    {
      label: 'header信息',
      name: 'headers',
      layout: 'horizontal',
      labelWidth: 80,
      typeRender: <EditorCodeMirrorModal />,
    },
    {
      label: '解析函数',
      name: 'returnFn',
      layout: 'horizontal',
      labelWidth: 80,
      initialValue: 'function (res){\n   return res.data;\n}',
      typeRender: <CodeTextArea style={{ width: '100%' }} />,
    },
  ];

  const onFieldsChange: FormRenderProps['onFieldsChange'] = ({ name }) => {
    if (!name) return;
    const newConfig = requestForm.getFieldValue();
    onChange && onChange(newConfig);
  };

  return (
    <div className={classNames(classes.cls, className)} {...rest}>
      <FormRender
        tagName="div"
        form={requestForm}
        widgetList={widgetList}
        onFieldsChange={onFieldsChange}
      />
    </div>
  );
});

export default RequestSetting;
