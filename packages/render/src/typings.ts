import React, { ReactNode } from 'react';
import { SimpleFormRender } from './store';

/* eslint-disable */

// 组件类型
export type ReactComponent<P> = React.ComponentType<P> | React.ForwardRefExoticComponent<P>;

export type FormConfig = {
	Form: React.FunctionComponent<{ [key in string]: any }>;
	Item: ReactComponent<{ [key in string]: any }>;
	context?: { [key in string]: any };
	form?: any;
}

// 预处理后的节点信息
export type FRGenerateNode = {
	type?: string | ReactComponent<any>;
	props?: Record<string, unknown>;
	children?: any;
	inside?: ReactComponent<any> | ReactNode | FRGenerateNode; // 节点的内层
	outside?: ReactComponent<any> | ReactNode | FRGenerateNode; // 节点的外层
	readOnly?: boolean; // 只读模式
	readOnlyRender?: ReactNode | ((context?: FRContext) => ReactNode); // 只读模式下的组件
	typeRender?: ReactNode | ((context?: FRContext) => ReactNode); // 表单控件自定义渲染
	hidden?: boolean;
} & React.ComponentProps<FormConfig['Item']>;

export type WithExpression<T> = {
	[P in keyof T]: T[P] extends any[] ? ArrWithExpression<T[P]> : T[P] | string;
};

export type ArrWithExpression<T extends Array<any> | undefined> = Array<WithExpression<NonNullable<T>[number]>>

// 编译前的节点信息
export type FRNode = WithExpression<Omit<FRGenerateNode, 'inside' | 'outside'> & {
	inside?: ReactComponent<any> | ReactNode | FRNode;
	outside?: ReactComponent<any> | ReactNode | FRNode;
}>;

// options参数
export type FROptions = Partial<FRGenerateNode> & { [key in string]: any };

// context
export type FRContext = {
	_options: FROptions &
	Pick<FormChildrenProps, 'formrender'> &
	Pick<FormConfig, 'form'> & {
		index?: number;
		path?: Array<string | number>;
	};
};

// 渲染节点组件
export type FormRenderNodeProps = {
	formrender: SimpleFormRender;
	widget: FRNode;
	index?: FRContext['_options']['index'];
	path?: FRContext['_options']['path'];
	onValuesChange?: (...args) => void;
};

// 渲染列表
export type FormChildrenProps = {
	/**@deprecated no longer recommended, please use 'variables' instead */
	plugins?: Record<string, unknown>; // 外部模块
	formrender?: SimpleFormRender;
	wrapper?: FRNode['inside'];
	options?: FROptions | ((frGenerateNode) => FROptions);
	widgetList?: Array<FRNode>; // 渲染数据
	variables?: Record<string, unknown>; // 外部模块
	parser?: <V>(value?: V, variables?: object) => V;
	components?: Record<string, ReactComponent<any>>; // 注册组件
	formConfig?: FormConfig;
	onRenderChange?: (newData?: FormChildrenProps['widgetList'], oldData?: FormChildrenProps['widgetList']) => void;
};

export type FormRenderProps = FormChildrenProps & React.ComponentProps<FormConfig['Form']>;

/* eslint-enable */
