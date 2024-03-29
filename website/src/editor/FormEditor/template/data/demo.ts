export default [{
  name: "Input_Z4MDXH",
  type: "Input",
  props: {
    placeholder: "请输入",
    maxLength: 30,
    size: "middle",
    disabled: "{{(formvalues['name1'] == 1 ? true : undefined)}}"
  },
  layout: "horizontal",
  labelAlign: "right",
  labelWidth: 120,
  colon: false,
  panel: {
    icon: "text-field",
    label: "输入框"
  },
  label: "输入框",
  rules: [{
    required: "{{(formvalues['name1'] == 1 ? true : undefined)}}",
    message: "222"
  }]
}, {
  name: "name1",
  props: {
    optionType: "default",
    size: "middle",
    options: [{
      label: "选项1",
      value: "1"
    }, {
      label: "选项2",
      value: "2"
    }]
  },
  layout: "horizontal",
  labelAlign: "right",
  labelWidth: 120,
  colon: false,
  panel: {
    icon: "radio-field",
    label: "单选框"
  },
  label: "单选框",
  type: "Radio.Group",
  initialValue: "2"
}, {
  panel: {
    icon: "html-text",
    label: "富文本",
    nonform: true
  },
  type: "RichText",
  initialValue: "\u003Cp>\u003Cstrong>自定义富文本\u003C/strong>\u003C/p>"
}, {
  name: "RichEditor_MNLQ1w",
  layout: "horizontal",
  labelAlign: "right",
  labelWidth: 120,
  colon: false,
  panel: {
    icon: "rich-editor-field",
    label: "富文本编辑器"
  },
  label: "富文本编辑器",
  type: "RichEditor",
  props: {
    style: {
      width: "100%"
    }
  }
}, {
  name: "ImageUpload_tQB2QC",
  props: {
    formdataKey: "file",
    maxCount: 5,
    maxSize: 5,
    uploadCallback: "{{(data) => ({ fileId: data.fileId })}}"
  },
  layout: "horizontal",
  labelAlign: "right",
  labelWidth: 120,
  colon: false,
  panel: {
    icon: "picture-upload-field",
    label: "图片上传"
  },
  label: "图片上传",
  type: "ImageUpload"
}, {
  name: "FileUpload_EPleIi",
  props: {
    formdataKey: "file",
    maxCount: 5,
    maxSize: 5,
    uploadCallback: "{{(data) => ({ fileId: data.fileId })}}"
  },
  layout: "horizontal",
  labelAlign: "right",
  labelWidth: 120,
  colon: false,
  panel: {
    icon: "file-upload-field",
    label: "文件上传"
  },
  label: "文件上传",
  type: "FileUpload"
}, {
  name: "Cascader_wLg29r",
  layout: "horizontal",
  labelAlign: "right",
  labelWidth: 120,
  colon: false,
  panel: {
    icon: "cascader-field",
    label: "级联选择器"
  },
  label: "级联选择器",
  type: "Cascader",
  props: {
    style: {
      width: "100%"
    },
    options: [{
      value: "zhejiang",
      label: "Zhejiang",
      children: [{
        value: "hangzhou",
        label: "Hangzhou",
        children: [{
          value: "xihu",
          label: "West Lake"
        }]
      }]
    }, {
      value: "jiangsu",
      label: "Jiangsu",
      children: [{
        value: "nanjing",
        label: "Nanjing",
        children: [{
          value: "zhonghuamen",
          label: "Zhong Hua Men"
        }]
      }]
    }]
  }
}, {
  name: "Rate_hCq-cT",
  props: {
    count: 5
  },
  layout: "horizontal",
  labelAlign: "right",
  labelWidth: 120,
  colon: false,
  panel: {
    icon: "rate-field",
    label: "评分"
  },
  label: "评分",
  type: "Rate"
}, {
  name: "Slider_zuiT69",
  props: {
    min: 0,
    max: 100,
    step: 1,
    style: {
      width: "100%"
    }
  },
  layout: "horizontal",
  labelAlign: "right",
  labelWidth: 120,
  colon: false,
  panel: {
    icon: "slider-field",
    label: "滑动输入"
  },
  label: "滑动输入",
  type: "Slider"
}, {
  name: "DatePickerRangePicker_tS1QPN",
  props: {
    placeholder: "请输入",
    picker: "date",
    format: "YYYY-MM-DD",
    size: "middle",
    style: {
      maxWidth: "300px",
      width: "100%"
    }
  },
  layout: "horizontal",
  labelAlign: "right",
  labelWidth: 120,
  colon: false,
  panel: {
    icon: "date-field",
    label: "日期范围"
  },
  label: "日期范围",
  valueSetter: "{{(value)=> value instanceof Array ? value.map((item) => typeof item === 'string' ? dayjs(item) : undefined) : undefined}}",
  valueGetter: "{{(value) => value instanceof Array ? value.map((item) => dayjs.isDayjs(item) ? item.format(formvalues.props && formvalues.props.format || 'YYYY-MM-DD') : undefined) : undefined}}",
  type: "DatePicker.RangePicker"
}, {
  name: "DatePicker_Kqpj5V",
  props: {
    placeholder: "请输入",
    picker: "date",
    format: "YYYY-MM-DD",
    size: "middle",
    style: {
      maxWidth: "300px",
      width: "100%"
    }
  },
  layout: "horizontal",
  labelAlign: "right",
  labelWidth: 120,
  colon: false,
  panel: {
    icon: "date-field",
    label: "日期选择器"
  },
  label: "日期选择器",
  valueSetter: "{{(value)=> (typeof value === 'string' ? dayjs(value) : undefined)}}",
  valueGetter: "{{(value) => (dayjs.isDayjs(value) ? value.format(formvalues.props && formvalues.props.format || 'YYYY-MM-DD') : undefined)}}",
  type: "DatePicker"
}, {
  name: "TimePickerRangePicker_XTNcwp",
  props: {
    placeholder: "请输入",
    format: "HH:mm:ss",
    size: "middle",
    allowClear: true,
    style: {
      maxWidth: "300px",
      width: "100%"
    }
  },
  layout: "horizontal",
  labelAlign: "right",
  labelWidth: 120,
  colon: false,
  panel: {
    icon: "time-field",
    label: "时间范围"
  },
  label: "时间范围",
  type: "TimePicker.RangePicker",
  valueSetter: "{{(value)=> value instanceof Array ? value.map((item) => typeof item === 'string' ? dayjs(item, 'HH:mm:ss') : undefined) : undefined}}",
  valueGetter: "{{(value) => value instanceof Array ? value.map((item) => dayjs.isDayjs(item) ? item.format(formvalues.props && formvalues.props.format || 'HH:mm:ss') : undefined) : undefined}}"
}, {
  name: "TimePicker_pBsp7C",
  props: {
    placeholder: "请输入",
    format: "HH:mm:ss",
    size: "middle",
    allowClear: true,
    style: {
      maxWidth: "300px",
      width: "100%"
    }
  },
  layout: "horizontal",
  labelAlign: "right",
  labelWidth: 120,
  colon: false,
  panel: {
    icon: "time-field",
    label: "时间选择器"
  },
  label: "时间选择器",
  type: "TimePicker",
  valueSetter: "{{(value) => typeof value === 'string' ? dayjs(value, 'HH:mm:ss') : undefined}}",
  valueGetter: "{{(value) => dayjs.isDayjs(value) ? value.format(formvalues.props && formvalues.props.format || 'HH:mm:ss') : undefined}}"
}, {
  name: "Switch_9nD5u7",
  props: {
    size: "middle"
  },
  layout: "horizontal",
  labelAlign: "right",
  labelWidth: 120,
  colon: false,
  panel: {
    icon: "switch-field",
    label: "开关"
  },
  label: "开关",
  type: "Switch",
  valueProp: "checked"
}, {
  name: "Select_0IP_Kw",
  props: {
    placeholder: "请输入",
    maxTagCount: 10,
    size: "middle",
    style: {
      width: "100%"
    },
    options: [{
      label: "选项1",
      value: "1"
    }, {
      label: "选项2",
      value: "2"
    }]
  },
  layout: "horizontal",
  labelAlign: "right",
  labelWidth: 120,
  colon: false,
  panel: {
    icon: "select-field",
    label: "下拉框"
  },
  label: "下拉框",
  type: "Select"
}, {
  name: "CheckboxGroup_E0n01k",
  layout: "horizontal",
  labelAlign: "right",
  labelWidth: 120,
  colon: false,
  panel: {
    icon: "checkbox-field",
    label: "多选框"
  },
  label: "多选框",
  type: "Checkbox.Group",
  valueSetter: "{{(value)=> (value instanceof Array ? value : [])}}",
  props: {
    options: [{
      label: "选项1",
      value: "1"
    }, {
      label: "选项2",
      value: "2"
    }]
  }
}];
