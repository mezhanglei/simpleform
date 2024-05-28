export default {
  panel: {
    icon: 'table',
    label: '表格布局',
  },
  type: 'Table',
  props: {},
  children: [
    {
      type: 'TableRow',
      children: [
        {
          type: 'TableCell',
          children: [
            {
              type: 'Input',
              name: 'name1',
              props: {}
            }
          ]
        },
        {
          type: 'TableCell',
          children: [
            {
              type: 'Input',
              name: 'name2',
              props: {}
            }
          ]
        }
      ]
    }
  ]
};
