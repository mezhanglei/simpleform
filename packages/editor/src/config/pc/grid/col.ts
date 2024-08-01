import GridColSetting from './col-setting';

export default {
  panel: {
    label: '栅格列',
    nonform: true,
    nonselection: true,
  },
  type: 'GridCol',
  props: { span: 12 },
  setting: { ...GridColSetting },
};
