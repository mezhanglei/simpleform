
export default {
  panel: {
    icon: 'time-field',
    label: '时间范围',
  },
  label: '时间范围',
  type: 'TimePicker.RangePicker',
  valueSetter: "{{(value)=> value instanceof Array ? value.map((item) => typeof item === 'string' ? dayjs(item, 'HH:mm:ss') : undefined) : undefined}}",
  valueGetter: "{{(value) => value instanceof Array ? value.map((item) => dayjs.isDayjs(item) ? item.format(formvalues.props && formvalues.props.format || 'HH:mm:ss') : undefined) : undefined}}",
  props: {
    style: { maxWidth: '300px', width: '100%' },
  },
};
