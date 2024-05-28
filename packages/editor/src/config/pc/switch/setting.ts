const baseSetting = [
  {
    label: '字段名',
    name: 'name',
    type: 'Input'
  },
  {
    label: '默认值',
    name: 'initialValue',
    type: 'Switch',
    valueProp: 'checked',
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
  }
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
