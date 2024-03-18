import GridRowSetting from './row-setting';

export default {
  panel: {
    icon: 'grid',
    label: '栅格布局',
    nonform: true,
  },
  type: 'GridRow',
  setting: { ...GridRowSetting }
};
