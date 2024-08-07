import TableCellConfig from './cell';
import Setting from './setting';
export default {
  panel: {
    icon: 'table',
    label: '表格布局',
    nonform: true,
    nonselection: true,
  },
  type: 'LayoutTable',
  rows: [
    [TableCellConfig]
  ],
  setting: Setting,
};
