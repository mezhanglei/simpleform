export default [{
  name: "Input_x0tII_",
  type: "Input",
  props: {
    placeholder: "请输入",
    maxLength: 30,
    size: "middle"
  },
  layout: "horizontal",
  labelAlign: "right",
  labelWidth: 120,
  colon: false,
  panel: {
    icon: "text-field",
    label: "输入框"
  },
  label: "输入框"
}, {
  name: "RadioGroup_4jOzVX",
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
  type: "Radio.Group"
}, {
  name: "Switch_azmb3k",
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
}];
