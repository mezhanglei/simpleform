
export default {
  panel: {
    icon: 'date-field',
    label: '日期范围',
  },
  label: '日期范围',
  valueSetter: "{{(value)=> value instanceof Array ? value.map((item) => typeof item === 'string' ? dayjs(item) : undefined) : undefined}}",
  valueGetter: "{{(value) => value instanceof Array ? value.map((item) => dayjs.isDayjs(item) ? item.format(formvalues.props && formvalues.props.format || 'YYYY-MM-DD') : undefined) : undefined}}",
  type: 'DatePicker.RangePicker',
  props: {
    style: { maxWidth: '300px', width: '100%' },
  },
};

