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
    name: 'props.options',
    type: 'DataSetting',
    label: '选项数据',
    props: {
      includes: ['json', 'request', 'dynamic']
    }
  },
];

const operationSetting = [
  {
    name: 'hidden',
    type: 'CheckboxWithRules',
    inline: true,
    compact: true,
    children: '隐藏'
  },
  {
    name: 'props.disabled',
    type: 'CheckboxWithRules',
    inline: true,
    compact: true,
    children: '禁用'
  },
  {
    name: 'props.allowClear',
    type: 'CheckboxWithRules',
    inline: true,
    compact: true,
    children: '可清除'
  },
  {
    name: 'props.multiple',
    type: 'CheckboxWithRules',
    inline: true,
    compact: true,
    children: '多选'
  },
  {
    name: 'props.showSearch',
    type: 'CheckboxWithRules',
    inline: true,
    compact: true,
    children: '可搜索'
  }
];

const rulesSetting = [
  {
    name: 'rules',
    type: 'ValidatorSetting',
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
