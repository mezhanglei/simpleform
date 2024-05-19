import React from "react";
import classnames from "classnames";
import './index.less';
import ColumnSelection from "./column-selection";
import { FormTableProps } from "..";
import pickAttrs from '../../../../utils/pickAttrs';
import { CustomFormRenderProps, Form, joinFormPath } from "../../../../formrender";
import BaseDnd from "../../../../view/BaseDnd";

const EditorTable = React.forwardRef<HTMLDivElement, FormTableProps<unknown>>(({
  columns = [],
  disabled,
  className,
  style,
  value,
  onChange,
  _options,
  ...restTable
}, ref) => {

  const prefix = "design-table";
  const Classes = {
    Table: prefix,
    TableBody: `${prefix}-body`,
    TableCol: `${prefix}-col`,
    TableSelection: `${prefix}-selection`,
    TableColHead: `${prefix}-col__head`,
    TableColBody: `${prefix}-col__body`,
    TableDnd: `${prefix}-dnd`,
    placeholder: `${prefix}-placeholder`,
  };

  const path = _options?.path;
  const form = _options?.form;
  const formrender = _options?.formrender;
  const context = _options?.context;
  const { settingForm } = context?.state || {};

  // 监听列控件设置值
  const columnInputChange: CustomFormRenderProps['onValuesChange'] = ({ value }) => {
    settingForm && settingForm.setFieldValue('initialValue', value);
  };

  const columnsPath = joinFormPath(path, 'props.columns');

  return (
    <div
      className={classnames([Classes.Table, className])}
      {...pickAttrs(restTable)}
      style={style}
      ref={ref}>
      <BaseDnd
        className='table-dnd'
        _options={_options}
        dndPath={columnsPath}
        dndList={_options?.props?.columns as unknown[]}
        group={{
          name: "table-columns",
          pull: "clone",
          put: ['sort-field', 'panel']
        }}
      >
        {
          columns?.map((column, colIndex) => {
            const { label, type, props, ...restColumn } = column;
            const columnInstance = formrender?.createFormElement({ type: type, props: Object.assign({ disabled, form: form, formrender: formrender }, props) });
            return (
              <ColumnSelection
                key={colIndex}
                className={Classes.TableSelection}
                column={column}
                colIndex={colIndex}
                _options={{ ..._options, path: columnsPath }}>
                <div className={Classes.TableCol}>
                  <div className={Classes.TableColHead}>
                    {label}
                  </div>
                  <div className={Classes.TableColBody}>
                    <Form.Item {...restColumn} label="" onValuesChange={columnInputChange}>
                      {React.isValidElement(columnInstance) ? ({ bindProps }) => React.cloneElement(columnInstance, bindProps) : columnInstance}
                    </Form.Item>
                  </div>
                </div>
              </ColumnSelection>
            );
          })
        }
      </BaseDnd>
      {!columns?.length && <span className={Classes.placeholder}>将控件拖拽到此处</span>}
    </div>
  );
});

export default EditorTable;
