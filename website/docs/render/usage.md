---
title: 高级用法
order: 1
---

# 高级用法

## 自定义表单域显示组件
`FormRender`支持更换为自定义的表单域显示组件, 参考示例如下：
```javascript
import { Item } from './Item';

<FormRender options={{ component: Item }} />
```
<code src="../../src/render/FieldItem/index.tsx"></code>

## 自定义formConfig
- `FormRender`默认继承内置的`@simpleform/form`相关配置. 但是如果用户很想使用自己的`Form`组件，则可以自定义相关配置.
- 注意：更换之后，所有涉及到`Form`的相关属性和方法需要切换到新的`Form`组件.
```javascript
export type FormConfig = {
	Form: React.FunctionComponent<{ [key in string]: any }>; // Form组件
	Item: ReactComponent<{ [key in string]: any }>; // Form.Item组件
	context?: { [key in string]: any }; // Form的context
	form?: any; // form实例
}

// 自定义formConfig伪代码示例：更换为antd的Form组件
import { Form } from 'antd';
import { FormContext } from 'antd/es/form/context';
import { useForm } from 'antd/es/form/Form';
import FormRender from '@simpleform/render'

const [form] = useForm()
const formContext = useContext(FormContext)

<FormRender 
  formConfig={{
    Form,
    Item: Form.Item,
    context: formContext,
    form,
  }}
  />
```
