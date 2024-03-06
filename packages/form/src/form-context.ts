import React from 'react';
import { FormItemProps } from './form-item';
import { SimpleForm } from './form-store';

export type SimpleFormContextProps<T = FormItemProps> = { form?: SimpleForm } & T;
export const SimpleFormContext = React.createContext<SimpleFormContextProps>({});
export const FormInitialValuesContext = React.createContext<any | undefined>(undefined);
