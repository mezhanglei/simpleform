import React, { useContext, CSSProperties, useMemo } from 'react';
import { SimpleFormContext } from './context';
import { useFormError } from './hooks';
import { Item, ItemProps } from './components/Item';
import { ItemCore, ItemCoreProps } from './core';

export type FormItemOptions<P = ItemProps> = Omit<P, 'children'> & ItemCoreProps & {
  component?: React.ComponentType<any> | React.ForwardRefExoticComponent<any> | null;
}
export type FormItemProps<P = ItemProps> = FormItemOptions<P> & {
  className?: string;
  style?: CSSProperties;
}

export const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>((props, ref) => {
  const { form, ...options } = useContext(SimpleFormContext);
  const mergeProps = Object.assign(options, props);
  const { children, ...fieldProps } = mergeProps;
  const {
    name,
    index,
    trigger,
    validateTrigger,
    valueProp,
    valueGetter,
    valueSetter,
    errorClassName,
    onFieldsChange,
    onValuesChange,
    initialValue,
    rules,
    component = Item,
    ...rest
  } = fieldProps;

  const [error] = useFormError(form, name);
  const nonform = rest?.nonform || rest?.readOnly;
  const isHaveRequired = useMemo(() => (rules instanceof Array && rules?.find((rule) => rule?.required === true)), [rules]);
  const required = isHaveRequired && nonform !== true ? true : rest?.required;
  const FieldComponent = component;

  const childs = (
    <ItemCore
      nonform={nonform}
      name={name}
      index={index}
      trigger={trigger}
      validateTrigger={validateTrigger}
      valueProp={valueProp}
      valueGetter={valueGetter}
      valueSetter={valueSetter}
      rules={rules}
      initialValue={initialValue}
      errorClassName={errorClassName}
      onFieldsChange={onFieldsChange}
      onValuesChange={onValuesChange}
    >
      {children}
    </ItemCore>
  );

  return (
    FieldComponent ?
      <FieldComponent {...fieldProps} required={required} ref={ref} error={nonform !== true && error}>
        {childs}
      </FieldComponent>
      : childs
  );
});

FormItem.displayName = 'Form.Item';
