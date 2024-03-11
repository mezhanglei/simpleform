import Setting from './setting';
import FieldSetting from '../../fieldSetting';

export default {
  panel: {
    icon: 'slider-field',
    label: '滑动输入',
  },
  label: '滑动输入',
  type: 'Slider',
  props: {
    style: { width: '100%' }
  },
  setting: { ...Setting, ...FieldSetting },
};
