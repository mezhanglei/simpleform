import React from 'react';
import { FormProps } from './form';
import { FormItemOptions } from './form-item';

export const SimpleFormContext = React.createContext<FormItemOptions & Pick<FormProps, 'form'>>({});
export const FormInitialValuesContext = React.createContext<FormProps['initialValues']>({});
