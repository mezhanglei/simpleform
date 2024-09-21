const baseSetting = [
  {
    label: '字段名',
    name: 'name',
    type: 'Input'
  },
  {
    label: '默认值',
    name: 'initialValue',
    type: 'InputNumber',
  },
  {
    label: 'star总数',
    name: 'props.count',
    type: 'InputNumber',
    initialValue: 5
  }
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
    name: 'props.allowHalf',
    type: 'CheckboxWithRules',
    inline: true,
    compact: true,
    children: '可半选'
  }
];

const rulesSetting = [
  {
    name: 'rules',
    type: 'ValidatorSetting',
    compact: true,
    props: {
      includes: ['required', 'max', 'min'],
    }
  },
];

const setting = {
  '基础属性': baseSetting,
  '操作属性': operationSetting,
  '校验规则': rulesSetting,
};

export default setting;
