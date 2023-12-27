import React from 'react';
import { SimpleForm } from './form-store';

export type SimpleFormContextProps<T = { [key: string]: any }> = { form?: SimpleForm } & T;
export const SimpleFormContext = React.createContext<SimpleFormContextProps>({});
export const FormInitialValuesContext = React.createContext<any | undefined>(undefined);
