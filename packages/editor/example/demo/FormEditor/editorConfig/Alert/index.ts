import Setting from './setting';

export default {
  panel: {
    icon: 'alert',
    label: '提示',
    nonform: true,
  },
  type: 'Alert',
  labelWidth: 'auto',
  props: {
    style: { width: '100%' },
    message: '警告提示',
    description: '警告提示描述'
  },
  setting: { ...Setting }
};
