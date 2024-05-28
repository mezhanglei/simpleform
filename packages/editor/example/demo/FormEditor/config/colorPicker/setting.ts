const baseSetting = [{
  label: '默认值',
  name: 'initialValue',
  type: 'Input',
}];

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
  }];

const rulesSetting = [{
  name: 'rules',
  type: 'RulesGroup',
  compact: true,
  props: {
    includes: ['required']
  }
}];

const setting = {
  '基础属性': baseSetting,
  '操作属性': operationSetting,
  '校验规则': rulesSetting,
};

export default setting;
