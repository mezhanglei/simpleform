import Setting from './setting';

export default {
  panel: {
    icon: 'divider',
    label: '分割线',
    nonform: true,
  },
  type: 'Divider',
  labelWidth: 'auto',
  props: {
    style: { width: '100%' },
    label: '分割线',
    orientation: 'left',
    type: 'horizontal',
  },
  setting: { ...Setting },
};
