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
    name: 'props.allowHalf',
    type: 'OperateCheckbox',
    inline: true,
    compact: true,
    props: { children: '可半选' }
  }
];

const rulesSetting = [
  {
    name: 'rules',
    type: 'RulesGroup',
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
