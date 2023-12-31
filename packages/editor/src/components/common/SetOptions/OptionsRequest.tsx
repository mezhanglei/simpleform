import classNames from "classnames";
import React, { CSSProperties } from "react";
import CodeTextArea from "../CodeTextarea";
import { getFormItem } from '../../../utils/utils';
import { EditorCodeMirrorModal } from "../CodeMirror";
import FormRender, { useSimpleForm, FormRenderProps, EditorSelection } from "../../formrender";

export interface RequestResponseConfig {
  url?: string; // 请求的路径
  method?: string; // 请求方式
  paramsType?: string; // 参数类型
  params?: any; // 参数
  headers?: any; // headers携带的信息
  returnFn?: string | ((val: any) => any); // 解析函数字符串
}

export interface OptionsRequestProps extends EditorSelection {
  value?: RequestResponseConfig;
  onChange?: (val?: RequestResponseConfig) => void;
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

const OptionsRequest = React.forwardRef<HTMLElement, OptionsRequestProps>((props, ref) => {

  const {
    value,
    onChange,
    className,
    field,
    ...rest
  } = props;

  const context = field?.context;
  const { selected, editor } = context?.state || {};
  const selectedPath = selected?.path;
  const requestForm = useSimpleForm();
  const properties = {
    url: {
      label: '接口',
      layout: 'horizontal',
      labelWidth: 80,
      required: true,
      type: 'Input',
      props: {
        style: { width: '100%' },
      }
    },
    method: {
      label: '请求方式',
      layout: 'horizontal',
      labelWidth: 80,
      type: 'Select',
      props: {
        style: { width: '100%' },
        options: methodOptions
      }
    },
    paramsType: {
      label: '提交方式',
      layout: 'horizontal',
      labelWidth: 80,
      hidden: "{{formvalues && formvalues.method === 'post'}}",
      type: 'Select',
      props: {
        style: { width: '100%' },
        options: paramsTypeOptions
      }
    },
    params: {
      label: '请求参数',
      layout: 'horizontal',
      labelWidth: 80,
      typeRender: <EditorCodeMirrorModal />,
    },
    headers: {
      label: 'header信息',
      layout: 'horizontal',
      labelWidth: 80,
      typeRender: <EditorCodeMirrorModal />,
    },
    returnFn: {
      label: '解析函数',
      layout: 'horizontal',
      labelWidth: 80,
      initialValue: 'function (res){\n   return res.data;\n}',
      typeRender: <CodeTextArea style={{ width: '100%' }} />,
    },
  };

  const onFieldsChange: FormRenderProps['onFieldsChange'] = ({ name, value }) => {
    if (!name) return;
    const oldProps = getFormItem(editor, selectedPath)?.props || {};
    const newConfig = oldProps?.options || {};
    newConfig[name] = value;
    onChange && onChange(newConfig);
  };

  return (
    <div className={classNames(classes.cls, className)} {...rest}>
      <FormRender
        tagName="div"
        form={requestForm}
        properties={properties}
        onFieldsChange={onFieldsChange}
      />
    </div>
  );
});

export default OptionsRequest;
