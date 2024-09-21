import GridSetting from './setting';
import GridColSetting from './col-setting';

export const GridColConfig = {
  panel: {
    label: '栅格列',
    nonform: true,
    nonselection: true,
  },
  type: 'GridCol',
  props: { span: 12 },
  setting: { ...GridColSetting },
};

export default {
  panel: {
    icon: 'grid',
    label: '栅格布局',
    nonform: true,
    nonselection: true,
  },
  type: 'Grid',
  setting: { ...GridSetting },
  cols: [
    { ...GridColConfig, children: [] },
    { ...GridColConfig, children: [] }
  ]
};
