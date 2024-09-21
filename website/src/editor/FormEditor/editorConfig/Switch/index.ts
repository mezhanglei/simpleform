import Setting from './setting';
import FieldSetting from '../fieldSetting';

export default {
  panel: {
    icon: 'switch-field',
    label: '开关',
  },
  label: '开关',
  type: 'Switch',
  valueProp: 'checked',
  props: {
  },
  setting: { ...Setting, ...FieldSetting },
};
