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
    label: '最小值',
    name: 'props.min',
    type: 'InputNumber',
    initialValue: 0
  },
  {
    label: '最大值',
    name: 'props.max',
    type: 'InputNumber',
    initialValue: 100
  },
  {
    label: '步长',
    name: 'props.step',
    type: 'InputNumber',
    initialValue: 1
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
    name: 'props.reverse',
    type: 'CheckboxWithRules',
    inline: true,
    compact: true,
    children: '反向'
  },
  {
    name: 'props.vertical',
    type: 'CheckboxWithRules',
    inline: true,
    compact: true,
    children: '垂直'
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
