import React, { useEffect } from 'react';
import { FormChildrenProps } from './typings';
import '@simpleform/form/lib/css/main.css';
import { useSimpleFormRender, useWidgetList } from './hooks';
import { createFRElement, getFRComponent } from './utils/transform';
import { deepClone } from './utils';
import { parseExpression } from './utils/parser';
import FormRenderNode from './node';

/* eslint-disable */
// 渲染表单children
export default function FormChildren(props: FormChildrenProps) {
	const curFormrender = useSimpleFormRender();
	const {
		wrapper,
		plugins,
		variables,
		onRenderChange,
		components = {},
		widgetList: propWidgetList,
		parser = parseExpression,
		formrender = curFormrender,
		path,
	} = props;

	const curVariables = Object.assign({}, plugins, variables);

	// formrender挂载所有props
	formrender.defineConfig({
		...props,
		parser,
		formrender,
		components,
		variables: curVariables,
	});

	const [widgetList, setWidgetList] = useWidgetList(formrender, onRenderChange);

	// 从props中同步widgetList
	useEffect(() => {
		const cloneData = deepClone(propWidgetList);
		setWidgetList(cloneData || []);
		formrender?.setWidgetList(cloneData, { ignore: true });
	}, [propWidgetList]);

	const [WrapperCom, WrapperProps] = getFRComponent(wrapper, formrender?.config?.components);
	const childs = widgetList?.map((widget, index) => {
		const curPath = (path || []).concat(index);
		return <FormRenderNode
			formrender={formrender}
			widget={widget}
			index={index}
			path={curPath}
			onValuesChange={() => {
				// 监听表单事件
				setWidgetList((old) => [...(old || [])]);
			}}
		/>
	})
	return <>{createFRElement(WrapperCom, WrapperProps, childs)}</>
}

FormChildren.displayName = 'Form.Children';

/* eslint-enable */
