import Setting from './setting';
import FieldSetting from '../fieldSetting';

export default {
  panel: {
    icon: 'text-field',
    label: '输入框',
  },
  label: '输入框',
  type: 'Input',
  setting: { ...Setting, ...FieldSetting },
};
