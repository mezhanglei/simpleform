import React from 'react';
import classNames from 'classnames';
import "./components.less";
import { pickAttrs } from '@simpleform/editor';

const prefix = "form-table";
export const Classes = {
  Table: `${prefix}`,
  TableBody: `${prefix}-body`,
  TableRow: `${prefix}-row`,
  TableHead: `${prefix}-head`,
  TableCell: `${prefix}-cell`,
};
export interface TableCellProps extends React.HtmlHTMLAttributes<HTMLTableCellElement> {
  componentType?: "th" | "td"
}
export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>((props, ref) => {
  const {
    children,
    className,
    componentType = "td",
    ...rest
  } = props;

  return React.createElement(
    componentType,
    { className: classNames(Classes.TableCell, className), ref, ...pickAttrs(rest) },
    children
  );
});

export type TableRowProps = React.HtmlHTMLAttributes<HTMLTableRowElement>;
export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>((props, ref) => {
  const {
    children,
    className,
    ...rest
  } = props;

  return (
    <tr className={classNames(Classes.TableRow, className)} ref={ref} {...pickAttrs(rest)}>
      {children}
    </tr>
  );
});

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HtmlHTMLAttributes<HTMLTableSectionElement>>((props, ref) => {
  const {
    children,
    className,
    ...rest
  } = props;

  return (
    <tbody className={classNames(Classes.TableRow, className)} ref={ref} {...pickAttrs(rest)}>
      {children}
    </tbody>
  );
});

export type TableHeadProps = React.HtmlHTMLAttributes<HTMLTableSectionElement>;
export const TableHead = React.forwardRef<HTMLTableSectionElement, TableHeadProps>((props, ref) => {
  const {
    children,
    className,
    ...rest
  } = props;

  return (
    <thead className={classNames(Classes.TableHead, className)} ref={ref} {...pickAttrs(rest)}>
      {children}
    </thead>
  );
});
