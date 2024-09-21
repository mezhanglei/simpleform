import Setting from './setting';
import cellSetting from './cell-setting';

export const TableCellConfig = {
  panel: {
    label: '单元格',
    nonform: true,
    nonselection: true,
  },
  type: 'TableCell',
  colspan: 1,
  rowspan: 1,
  children: [],
  setting: cellSetting,
};

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
