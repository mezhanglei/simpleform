const baseSetting = [
  {
    label: '提示',
    name: 'props.message',
    type: 'Input',
  },
  {
    label: '提示描述',
    name: 'props.description',
    type: 'Input',
  },
  {
    label: "样式",
    name: 'props.type',
    type: "Radio.Group",
    initialValue: 'success',
    props: {
      style: { width: '100%' },
      options: [
        { label: 'success', value: 'success' },
        { label: 'info', value: 'info' },
        { label: 'warning', value: 'warning' },
        { label: 'error', value: 'error' },
      ]
    }
  }
];

const operationSetting = [
  {
    type: 'CheckboxWithRules',
    name: 'hidden',
    inline: true,
    compact: true,
    children: '隐藏'
  },
  {
    name: 'props.showIcon',
    type: 'Checkbox',
    inline: true,
    compact: true,
    children: '显示图标'
  },
  {
    name: 'props.closable',
    type: 'Checkbox',
    inline: true,
    compact: true,
    children: '可关闭'
  }
];

const setting = {
  '基础属性': baseSetting,
  '操作属性': operationSetting,
};

export default setting;
