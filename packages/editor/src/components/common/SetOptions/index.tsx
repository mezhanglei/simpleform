import { Select } from "antd";
import React, { useMemo } from "react";
import './index.less';
import LinkageSetting from "./Linkage";
import RequestSetting from './request';
import OptionList from './list';
import { EditorCodeMirror } from "../CodeMirror";
import { getWidgetItem, setWidgetItem } from "../../../utils/utils";
import { joinFormPath, CommonFormProps } from "../../../formrender";

/**
 * 数据源的配置组件。
 */

export interface SetOptionsProps extends CommonFormProps<any> {
  includes?: string[]; // 当前可用模块
}

const prefixCls = 'option-source';
const classes = {
  type: `${prefixCls}-type`,
  component: `${prefixCls}-component`
};

const OptionsWidget = {
  list: { label: '选项数据', component: OptionList },
  json: { label: '静态数据', component: EditorCodeMirror },
  request: { label: '接口请求', component: RequestSetting },
  dynamic: { label: '联动设置', component: LinkageSetting },
};
type OptionsKey = keyof typeof OptionsWidget;
type OptionsKeyList = Array<OptionsKey>;
const OptionsKeys = Object.keys(OptionsWidget) as OptionsKeyList;

const SetOptions: React.FC<SetOptionsProps> = (props) => {

  const {
    includes = OptionsKeys,
    value,
    onChange,
    _options
  } = props;

  const context = _options?.context;
  const { selected, editor } = context?.state || {};
  const buttons = useMemo(() => (OptionsKeys?.filter((key) => includes?.includes(key))), [includes]);
  const optionSelect = getWidgetItem<OptionsKey>(editor, joinFormPath(selected?.path, 'props.optionSelect')) || buttons[0];

  const selectTypeChange = (key?: OptionsKey) => {
    if (key) {
      onChange && onChange(undefined);
      setWidgetItem(editor, key, joinFormPath(selected?.path, 'props.optionSelect'));
    }
  };

  const handleChange = (value) => {
    if (!optionSelect) return;
    onChange && onChange(value);
  };

  const Child = optionSelect && OptionsWidget[optionSelect]?.component;

  return (
    <>
      <div className={classes.type}>
        <Select value={optionSelect} style={{ width: "100%" }} onChange={selectTypeChange}>
          {
            buttons.map((key) => (
              <Select.Option key={key} value={key}>
                {OptionsWidget[key].label}
              </Select.Option>
            ))
          }
        </Select>
      </div>
      <div className={classes.component}>
        {Child ? <Child value={value} onChange={handleChange} /> : null}
      </div>
    </>
  );
};

export default SetOptions;
