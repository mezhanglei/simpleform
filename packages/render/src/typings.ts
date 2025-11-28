import React, { ReactNode } from 'react';
import { FormItemProps, FormProps } from '@simpleform/form';
import { SimpleFormRender } from './store';

/* eslint-disable */
// 组件类型
export type ReactComponent<P> = React.ComponentType<P> | React.ForwardRefExoticComponent<P>;

// 预处理后的节点信息
export type FRGenerateNode = FormItemProps & {
	type?: string | ReactComponent<any>;
	props?: Record<string, unknown>;
	children?: any;
	inside?: ReactComponent<any> | ReactNode | FRGenerateNode; // 节点的内层
	outside?: ReactComponent<any> | ReactNode | FRGenerateNode; // 节点的外层
	readOnly?: boolean; // 只读模式
	readOnlyRender?: ReactNode | ((context?: FRContext) => ReactNode); // 只读模式下的组件
	typeRender?: ReactNode | ((context?: FRContext) => ReactNode); // 表单控件自定义渲染
	hidden?: boolean;
};

export type WithExpression<T> = {
	[P in keyof T]: T[P] | string;
};

export type ArrWithExpression<T extends Array<any> | undefined> = Array<WithExpression<NonNullable<T>[number]>>

// 编译前的节点信息
export type FRNode = WithExpression<Omit<FRGenerateNode, 'rules'> & {
	rules?: ArrWithExpression<FormItemProps['rules']>
}>;

// options参数
export type FROptions = Partial<FRGenerateNode> & { [key in string]: any };

// context
export type FRContext = {
	_options: FROptions &
	Pick<FormChildrenProps, 'formrender'> &
	Pick<FormProps, 'form'> & {
		index?: number;
		path?: Array<string | number>;
	};
};

export type CustomRenderType = <C>(children?: C, context?: FRContext) => C;

// 渲染节点组件
export type FormRenderNodeProps = Pick<FormProps, 'onValuesChange'> & {
	formrender: SimpleFormRender;
	widget: FRNode;
	index?: FRContext['_options']['index'];
	path?: FRContext['_options']['path'];
	renderList?: CustomRenderType;
	renderItem?: CustomRenderType;
};

// 渲染列表
export type FormChildrenProps = Pick<FormRenderNodeProps, 'renderList' | 'renderItem'> & {
	/**@deprecated no longer recommended */
	form?: FormProps['form'];
	formrender?: SimpleFormRender;
	wrapper?: FRNode['inside'];
	options?: FROptions | ((frGenerateNode) => FROptions);
	widgetList?: Array<FRNode>; // 渲染数据
	/**@deprecated no longer recommended, please use 'variables' instead */
	plugins?: Record<string, unknown>; // 外部模块
	variables?: Record<string, unknown>; // 外部模块
	parser?: <V>(value?: V, variables?: object) => V;
	components?: Record<string, ReactComponent<any>>; // 注册组件
	onRenderChange?: (newData?: FormChildrenProps['widgetList'], oldData?: FormChildrenProps['widgetList']) => void;
};

export type FormRenderProps = FormProps & Omit<FormChildrenProps, 'form'>;

/* eslint-enable */
