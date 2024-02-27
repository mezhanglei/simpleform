
export default {
  panel: {
    icon: 'date-field',
    label: '日期选择器',
  },
  label: '日期选择器',
  valueSetter: "{{(value)=> (typeof value === 'string' ? dayjs(value) : undefined)}}",
  valueGetter: "{{(value) => (dayjs.isDayjs(value) ? value.format(formvalues.props && formvalues.props.format || 'YYYY-MM-DD') : undefined)}}",
  type: 'DatePicker',
  props: {
  },
};
