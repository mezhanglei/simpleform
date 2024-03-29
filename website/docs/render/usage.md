---
title: 高级用法
order: 1
---

# 高级用法

## 自定义表单域显示组件
`FormRender`支持更换为自定义的表单域显示组件, 简易实例如下：
```javascript
import { Item } from './Item';

<FormRender options={{ component: Item }} />
```
<code src="../../src/render/FieldItem/index.tsx"></code>