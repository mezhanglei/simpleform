const baseSetting = [
  {
    label: '默认值',
    name: 'initialValue',
    type: 'RichEditorModalBtn',
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
];

const setting = {
  '基础属性': baseSetting,
  '操作属性': operationSetting,
};

export default setting;
