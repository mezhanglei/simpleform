const baseSetting = [
  {
    label: '字段名',
    name: 'name',
    type: 'Input'
  },
  {
    label: '默认值',
    name: 'initialValue',
    type: 'CodeTextArea',
  },
  {
    label: '占位字符',
    name: 'props.placeholder',
    type: 'Input',
    initialValue: '请输入'
  },
  {
    name: 'props.options',
    type: 'SetOptions',
    label: '选项数据',
    props: {
    }
  },
  {
    label: '选择模式',
    name: 'props.mode',
    type: "Select",
    props: {
      style: { width: '100%' },
      allowClear: true,
      options: [
        { label: '多选', value: 'multiple' },
        { label: '标签', value: 'tags' }
      ]
    }
  },
  {
    label: '标签最大数量',
    name: 'props.maxTagCount',
    type: 'InputNumber',
    hidden: "{{formvalues && formvalues.props && formvalues.props.mode !== 'tags'}}",
    initialValue: 10
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
  },
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
  },
  {
    name: 'props.allowClear',
    type: 'OperateCheckbox',
    inline: true,
    compact: true,
    props: { children: '可清除' }
  },
  {
    name: 'props.showSearch',
    type: 'OperateCheckbox',
    inline: true,
    compact: true,
    props: { children: '可搜索' }
  },
];

const rulesSetting = [
  {
    name: 'rules',
    type: 'RulesGroup',
    compact: true,
    props: {
      includes: ['required'],
    }
  },
];

const setting = {
  '基础属性': baseSetting,
  '操作属性': operationSetting,
  '校验规则': rulesSetting,
};

export default setting;
