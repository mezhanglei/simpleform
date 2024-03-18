export default {
  panel: {
    icon: 'table',
    label: '表格布局',
  },
  type: 'Table',
  props: {},
  widgetList: [
    {
      type: 'TableRow',
      widgetList: [
        {
          type: 'TableCell',
          widgetList: [
            {
              type: 'Input',
              name: 'name1',
              props: {}
            }
          ]
        },
        {
          type: 'TableCell',
          widgetList: [
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
