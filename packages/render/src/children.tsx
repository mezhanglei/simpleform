import React, { useContext, useEffect } from 'react';
import { FormChildrenProps } from './typings';
import { SimpleFormContext } from '@simpleform/form';
import '@simpleform/form/lib/css/main.css';
import { useSimpleFormRender, useWidgetList } from './hooks';
import { createFRElement, renderFRNodeList, withSide } from './utils/transform';
import { deepClone } from './utils';
import { parseExpression } from './utils/parser';

/* eslint-disable */
// 渲染表单children
export default function FormChildren(props: FormChildrenProps) {
	const curFormrender = useSimpleFormRender();
	const formContext = useContext(SimpleFormContext);
	const {
		wrapper,
		plugins,
		variables,
		onRenderChange,
		renderList,
		components = {},
		widgetList: propWidgetList,
		parser = parseExpression,
		form = formContext?.form,
		formrender = curFormrender,
	} = props;

	const curVariables = Object.assign({}, plugins, variables);

	// formrender挂载所有props
	formrender.defineConfig({
		...props,
		parser,
		form,
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

	const childs = renderFRNodeList(formrender, widgetList, formContext, {
    onValuesChange: () => {
      // 监听表单事件
      setWidgetList((old) => [...(old || [])]);
    },
  });

	const wrapperEle = createFRElement(wrapper, {}, formrender?.config?.components);

	return <>{withSide(childs, renderList, wrapperEle)}</>;
}

FormChildren.displayName = 'Form.Children';
/* eslint-enable */
