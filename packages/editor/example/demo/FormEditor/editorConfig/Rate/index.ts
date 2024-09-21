import Setting from './setting';
import FieldSetting from '../fieldSetting';

export default {
  panel: {
    icon: 'rate-field',
    label: '评分',
  },
  label: '评分',
  type: 'Rate',
  props: {
  },
  setting: { ...Setting, ...FieldSetting },
};
