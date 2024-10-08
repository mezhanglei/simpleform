import Setting from './setting';
import FieldSetting from '../fieldSetting';

export default {
  panel: {
    icon: 'select-field',
    label: '下拉框',
  },
  label: '下拉框',
  type: 'Select',
  props: {
    style: { width: "100%" },
    options: [{ label: '选项1', value: '1' }, { label: '选项2', value: '2' }]
  },
  setting: { ...Setting, ...FieldSetting },
};
