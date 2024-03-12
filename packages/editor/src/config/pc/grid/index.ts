import GridCol from './col';
import GridRow from './row';

export default {
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
