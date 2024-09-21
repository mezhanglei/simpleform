const baseSetting = [
  {
    label: '栅格占位格数',
    name: 'props.span',
    type: 'Slider',
    initialValue: 12,
    props: {
      style: { width: '100%' },
      max: 24
    }
  },
  {
    label: '栅格左侧间隔格数',
    name: 'props.offset',
    type: 'Slider',
    props: {
      style: { width: '100%' },
      max: 24
    }
  },
  {
    label: '栅格向左移动格数',
    name: 'props.pull',
    type: 'Slider',
    props: {
      style: { width: '100%' },
      max: 24
    }
  },
  {
    label: '栅格向右移动格数',
    name: 'props.push',
    type: 'Slider',
    props: {
      style: { width: '100%' },
      max: 24
    }
  }
];

const setting = {
  '基础属性': baseSetting,
};

export default setting;
