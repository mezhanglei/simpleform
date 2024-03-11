import Setting from './setting';
import FieldSetting from '../../fieldSetting';

export default {
  panel: {
    icon: 'radio-field',
    label: '单选框',
  },
  label: '单选框',
  type: 'Radio.Group',
  props: {
    options: [{ label: '选项1', value: '1' }, { label: '选项2', value: '2' }]
  },
  setting: { ...Setting, ...FieldSetting },
};
