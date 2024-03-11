import GridCol from './col';
import GridRow from './row';

export default {
  panel: {
    icon: 'grid',
    label: '栅格布局',
    includes: ['GridCol'],
  },
  ...GridRow,
  properties: {
    col1: {
      ...GridCol,
      props: { span: 12 },
      properties: {
      }
    },
    col2: {
      ...GridCol,
      props: { span: 12 },
      properties: {
      }
    },
  }
};
