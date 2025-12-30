import React, { useEffect } from 'react';
import { FormChildrenProps } from './typings';
import '@simpleform/form/lib/css/main.css';
import { useFormConfig, useSimpleFormRender, useWidgetList } from './hooks';
import { createFRElement, renderFRNodeList, withSide } from './utils/transform';
import { deepClone } from './utils';
import { parseExpression } from './utils/parser';

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

	const formConfig = useFormConfig(formrender?.config?.formConfig);
	const [widgetList, setWidgetList] = useWidgetList(formrender, onRenderChange);

	// 从props中同步widgetList
	useEffect(() => {
		const cloneData = deepClone(propWidgetList);
		setWidgetList(cloneData || []);
		formrender?.setWidgetList(cloneData, { ignore: true });
	}, [propWidgetList]);

	const childs = renderFRNodeList(formrender, widgetList, formConfig, {
		onValuesChange: () => {
			// 监听表单事件
			setWidgetList((old) => [...(old || [])]);
		},
	});

	const wrapperEle = createFRElement(wrapper, {}, formrender?.config?.components);

	return <>{withSide(childs, wrapperEle)}</>;
}

FormChildren.displayName = 'Form.Children';

/* eslint-enable */
