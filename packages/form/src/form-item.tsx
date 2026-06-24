import React, { useContext, CSSProperties, useMemo } from "react";
import { SimpleFormContext } from "./context";
import { useFormError } from "./hooks";
import { Item, ItemProps } from "./components/Item";
import { ItemCore, ItemCoreProps } from "./core";

export type FormItemOptions<P = ItemProps> = Omit<P, "children"> &
  ItemCoreProps & {
    component?:
      | React.ComponentType<any>
      | React.ForwardRefExoticComponent<any>
      | null;
  };
export type FormItemProps<P = ItemProps> = FormItemOptions<P> & {
  className?: string;
  style?: CSSProperties;
  noStyle?: boolean;
};

export const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  (props, ref) => {
    const { form, ...options } = useContext(SimpleFormContext);
    const mergeProps = Object.assign(options, props);
    const { children, ...fieldProps } = mergeProps;
    const { component = Item, noStyle, ...rest } = fieldProps;

    const [error] = useFormError(form, rest?.name);
    const nonform = rest?.nonform || rest?.readOnly;
    const isHaveRequired = useMemo(
      () =>
        rest?.rules instanceof Array &&
        rest?.rules?.find((rule) => rule?.required === true),
      [rest?.rules]
    );
    const required = isHaveRequired && nonform !== true ? true : rest?.required;
    const FieldComponent = component;

    const childs = (
      <ItemCore nonform={nonform} {...rest}>
        {children}
      </ItemCore>
    );

    return FieldComponent && !noStyle ? (
      <FieldComponent
        {...fieldProps}
        required={required}
        ref={ref}
        error={nonform !== true && error}
      >
        {childs}
      </FieldComponent>
    ) : (
      childs
    );
  }
);

FormItem.displayName = "Form.Item";
