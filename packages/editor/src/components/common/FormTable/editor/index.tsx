import React from "react";
import classnames from "classnames";
import './index.less';
import ColumnSelection from "./column-selection";
import TableDnd from './dnd';
import { FormTableProps } from "..";
import { setFormInitialValue } from "../../../../utils/utils";
import pickAttrs from '../../../../utils/pickAttrs';
import { Form } from "../../../formrender";

const EditorTable = React.forwardRef<HTMLTableElement, FormTableProps>(({
  columns = [],
  disabled,
  className,
  style,
  name,
  ...rest
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

  const context = rest?.field?.context;
  const { editor, settingForm } = context?.state || {};

  const onFieldsChange = (colIndex: number, newVal: any) => {
    // 设置初始值
    setTimeout(() => {
      setFormInitialValue(editor, settingForm, { path: rest?.path, attributeName: `props.columns[${colIndex}]` }, newVal);
    }, 0);
  };

  return (
    <div
      className={classnames([Classes.Table, className])}
      {...pickAttrs(rest)}
      style={style}
      ref={ref}>
      <TableDnd {...rest}>
        {
          columns?.map((column, colIndex) => {
            const columnInstance = rest?.formrender && rest.formrender.createFormElement({ type: column?.type, props: Object.assign({ disabled, form: rest?.form, formrender: rest?.formrender }, column?.props) });
            return (
              <ColumnSelection key={column?.dataIndex} className={Classes.TableSelection} {...rest} column={column} colIndex={colIndex}>
                <div className={Classes.TableCol}>
                  <div className={Classes.TableColHead}>
                    {column?.title}
                  </div>
                  <div className={Classes.TableColBody}>
                    {column?.hidden === true ? null :
                      <Form.Item name={column?.dataIndex} onFieldsChange={({ value }) => onFieldsChange(colIndex, value)}>
                        {columnInstance}
                      </Form.Item>
                    }
                  </div>
                </div>
              </ColumnSelection>
            );
          })
        }
      </TableDnd>
      {!columns?.length && <span className={Classes.placeholder}>将控件拖拽到此处</span>}
    </div>
  );
});

export default EditorTable;
