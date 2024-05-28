const baseSetting = [
  {
    label: '字段名',
    name: 'name',
    type: 'Input'
  },
  {
    label: '最小行数',
    name: 'props.minRows',
    type: 'InputNumber',
    initialValue: 0
  },
  {
    label: '最大行数',
    name: 'props.maxRows',
    type: 'InputNumber',
    initialValue: 50
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
    name: 'props.showBtn',
    type: 'OperateCheckbox',
    inline: true,
    compact: true,
    children: '可增删'
  },
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
