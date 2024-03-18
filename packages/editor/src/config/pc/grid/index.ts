import GridCol from './col';
import GridRow from './row';

export default {
  ...GridRow,
  widgetList: [
    {
      ...GridCol,
      props: { span: 12 },
      widgetList: []
    },
    {
      ...GridCol,
      props: { span: 12 },
      widgetList: []
    }
  ]
};
