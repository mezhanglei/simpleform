const baseSetting = [
  {
    label: '字段名',
    name: 'name',
    type: 'Input'
  },
  {
    label: '上传接口路径',
    name: 'props.action',
    type: 'Input',
  },
  {
    label: '接口响应数据',
    name: 'props.uploadCallback',
    type: 'Input.TextArea',
  },
  {
    label: '参数名',
    name: 'props.formdataKey',
    type: 'Input',
    initialValue: 'file'
  },
  {
    label: '最大允许上传个数',
    name: 'props.maxCount',
    type: 'InputNumber',
    initialValue: 5
  },
  {
    label: '文件大小限制(MB)',
    name: 'props.maxSize',
    type: 'InputNumber',
    initialValue: 5
  }
];

const operationSetting = [
  {
    name: 'hidden',
    type: 'OperateCheckbox',
    inline: true,
    compact: true,
    props: { children: '隐藏' }
  },
  {
    name: 'props.disabled',
    type: 'OperateCheckbox',
    inline: true,
    compact: true,
    props: { children: '禁用' }
  }
];

const rulesSetting = [
  {
    name: 'rules',
    type: 'RulesGroup',
    compact: true,
    props: {
      includes: ['required']
    }
  },
];

const setting = {
  '基础属性': baseSetting,
  '操作属性': operationSetting,
  '校验规则': rulesSetting,
};

export default setting;
