import GridSetting from './setting';
import GridCol from './col';

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
    { ...GridCol, children: [] },
    { ...GridCol, children: [] }
  ]
};
