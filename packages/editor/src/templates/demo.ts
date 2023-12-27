export default {
  "Input_3BKwl-": {
    "type": "Input",
    "props": {
      "placeholder": "请输入",
      "maxLength": 30,
      "size": "middle"
    },
    "layout": "horizontal",
    "labelAlign": "right",
    "labelWidth": 120,
    "colon": false,
    "panel": {
      "icon": "text-field",
      "label": "输入框"
    },
    "label": "输入框"
  },
  "RadioGroup_1Lhd6n": {
    "props": {
      "optionType": "default",
      "size": "middle",
      "options": [{
        "label": "选项1",
        "value": "1"
      }, {
        "label": "选项2",
        "value": "2"
      }]
    },
    "layout": "horizontal",
    "labelAlign": "right",
    "labelWidth": 120,
    "colon": false,
    "panel": {
      "icon": "radio-field",
      "label": "单选框"
    },
    "label": "单选框",
    "type": "Radio.Group"
  },
  "CheckboxGroup__mzIve": {
    "layout": "horizontal",
    "labelAlign": "right",
    "labelWidth": 120,
    "colon": false,
    "panel": {
      "icon": "checkbox-field",
      "label": "多选框"
    },
    "label": "多选框",
    "type": "Checkbox.Group",
    "props": {
      "options": [{
        "label": "选项1",
        "value": "1"
      }, {
        "label": "选项2",
        "value": "2"
      }]
    }
  },
  "Switch_URGEZU": {
    "props": {
      "size": "middle"
    },
    "layout": "horizontal",
    "labelAlign": "right",
    "labelWidth": 120,
    "colon": false,
    "panel": {
      "icon": "switch-field",
      "label": "开关"
    },
    "label": "开关",
    "type": "Switch",
    "valueProp": "checked"
  },
  "Select_3TedZs": {
    "props": {
      "placeholder": "请输入",
      "maxTagCount": 10,
      "size": "middle",
      "style": {
        "width": "100%"
      },
      "options": [{
        "label": "选项1",
        "value": "1"
      }, {
        "label": "选项2",
        "value": "2"
      }]
    },
    "layout": "horizontal",
    "labelAlign": "right",
    "labelWidth": 120,
    "colon": false,
    "panel": {
      "icon": "select-field",
      "label": "下拉框"
    },
    "label": "下拉框",
    "type": "Select"
  },
  "TimePicker_sr_irX": {
    "props": {
      "placeholder": "请输入",
      "format": "HH:mm:ss",
      "size": "middle",
      "allowClear": true
    },
    "layout": "horizontal",
    "labelAlign": "right",
    "labelWidth": 120,
    "colon": false,
    "panel": {
      "icon": "time-field",
      "label": "时间选择器"
    },
    "label": "时间选择器",
    "type": "TimePicker",
    "valueSetter": "{{(value) => typeof value === 'string' && dayjs(value, 'HH:mm:ss')}}",
    "valueGetter": "{{(value) => dayjs.isDayjs(value) && value.format(formvalues.props && formvalues.props.format || 'HH:mm:ss')}}"
  },
  "TimePickerRangePicker_6N0bd3": {
    "props": {
      "placeholder": "请输入",
      "format": "HH:mm:ss",
      "size": "middle",
      "allowClear": true
    },
    "layout": "horizontal",
    "labelAlign": "right",
    "labelWidth": 120,
    "colon": false,
    "panel": {
      "icon": "time-field",
      "label": "时间范围"
    },
    "label": "时间范围",
    "type": "TimePicker.RangePicker",
    "valueSetter": "{{(value)=> value instanceof Array && value.map((item) => typeof item === 'string' && dayjs(item, 'HH:mm:ss'))}}",
    "valueGetter": "{{(value) => value instanceof Array && value.map((item) => dayjs.isDayjs(item) && item.format(formvalues.props && formvalues.props.format || 'HH:mm:ss'))}}"
  },
  "DatePicker_xrK5uG": {
    "props": {
      "placeholder": "请输入",
      "picker": "date",
      "format": "YYYY-MM-DD",
      "size": "middle"
    },
    "layout": "horizontal",
    "labelAlign": "right",
    "labelWidth": 120,
    "colon": false,
    "panel": {
      "icon": "date-field",
      "label": "日期选择器"
    },
    "label": "日期选择器",
    "valueSetter": "{{(value)=> (typeof value === 'string' && dayjs(value))}}",
    "valueGetter": "{{(value) => (dayjs.isDayjs(value) && value.format(formvalues.props && formvalues.props.format || 'YYYY-MM-DD'))}}",
    "type": "DatePicker"
  }
};
