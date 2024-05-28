const baseSetting = [
  {
    label: '字段名',
    name: 'name',
    type: 'Input'
  },
  {
    label: "输入框类型",
    name: 'type',
    type: "Select",
    initialValue: "Input",
    props: {
      style: { width: '100%' },
      options: [
        { label: '单行输入', value: 'Input' },
        { label: '多行输入', value: 'Input.TextArea' },
        { label: '数字输入', value: 'InputNumber' },
        { label: '密码输入', value: 'Input.Password' },
      ]
    }
  },
  {
    label: '默认值',
    name: 'initialValue',
    type: "{{formvalues && formvalues.type ? formvalues.type : 'Input'}}",
  },
  {
    label: '占位字符',
    name: 'props.placeholder',
    type: 'Input',
    initialValue: '请输入'
  },
  {
    label: '最大输入字符数',
    name: 'props.maxLength',
    type: 'InputNumber',
    initialValue: 30
  },
  {
    label: "尺寸",
    name: 'props.size',
    type: "Radio.Group",
    initialValue: 'middle',
    props: {
      style: { width: '100%' },
      options: [
        { label: '大', value: 'large' },
        { label: '中', value: 'middle' },
        { label: '小', value: 'small' }
      ]
    }
  }
];

const operationSetting = [
  {
    name: 'hidden',
    type: 'OperateCheckbox',
    inline: true,
    compact: true,
    children: '隐藏'
  },
  {
    name: 'props.disabled',
    type: 'OperateCheckbox',
    inline: true,
    compact: true,
    children: '禁用'
  },
  {
    name: 'props.allowClear',
    type: 'OperateCheckbox',
    inline: true,
    compact: true,
    children: '可清除'
  }
];

const rulesSetting = [
  {
    name: 'rules',
    type: 'RulesGroup',
    compact: true,
    props: {
      includes: ['required', 'pattern', 'max', 'min'],
    }
  },
];

const setting = {
  '基础属性': baseSetting,
  '操作属性': operationSetting,
  '校验规则': rulesSetting,
};

export default setting;
