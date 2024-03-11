import Setting from './setting';

export default {
  panel: {
    icon: 'table',
    label: '可编辑表格',
  },
  label: '可编辑表格',
  type: 'FormTable',
  props: {
    showBtn: true,
    columns: [],
  },
  setting: { ...Setting },
};
