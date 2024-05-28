import GridCol from './col';
import GridRow from './row';

export default {
  ...GridRow,
  children: [
    {
      ...GridCol,
      props: { span: 12 },
      children: []
    },
    {
      ...GridCol,
      props: { span: 12 },
      children: []
    }
  ]
};
