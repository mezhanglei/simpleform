const baseSetting = [
  {
    label: '标题',
    name: 'props.label',
    type: 'Input',
  },
  {
    label: "对齐方式",
    name: 'props.orientation',
    type: "Radio.Group",
    props: {
      style: { width: '100%' },
      options: [
        { label: '左边对齐', value: 'left' },
        { label: '居中', value: 'center' },
        { label: '右边对齐', value: 'right' },
      ]
    }
  },
  {
    label: "位置",
    name: 'props.type',
    type: "Radio.Group",
    props: {
      style: { width: '100%' },
      options: [
        { label: '水平', value: 'horizontal' },
        { label: '垂直', value: 'vertical' },
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
    props: { children: '隐藏' }
  },
  {
    name: 'props.plain',
    type: 'Checkbox',
    inline: true,
    compact: true,
    props: { children: '正文样式' }
  },
  {
    name: 'props.dashed',
    type: 'Checkbox',
    inline: true,
    compact: true,
    props: { children: '是否虚线' }
  }
];

const setting = {
  '基础属性': baseSetting,
  '操作属性': operationSetting,
};

export default setting;
