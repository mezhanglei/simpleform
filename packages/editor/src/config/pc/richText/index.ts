import Setting from './setting';

export default {
  panel: {
    icon: 'html-text',
    label: '富文本',
  },
  type: 'RichText',
  initialValue: '<p><strong>自定义富文本</strong></p>',
  setting: { ...Setting }
};
