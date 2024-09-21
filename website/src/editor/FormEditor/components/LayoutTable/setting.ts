const baseSetting = [
  {
    label: "表格布局",
    name: 'props.tableLayout',
    type: "Select",
    props: {
      style: { width: '100%' },
      options: [
        { label: '固定宽度', value: 'fixed' },
        { label: '自动撑开', value: 'auto' },
      ]
    }
  }
];

const setting = {
  '基础属性': baseSetting,
};

export default setting;
