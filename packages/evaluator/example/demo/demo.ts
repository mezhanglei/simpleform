// import * as Babel from '@babel/standalone';
import createEvaluator from '../../lib';
import { getQuickJS } from 'quickjs-emscripten';
// 使用解释器执行一段包含多种操作和自定义变量的脚本
const script = `
 let a = 3;
 let b = 5;
 let sum = a + b;
 let randomValue = Math.random();
 let currentDate = new Date();
 const arr = [1,2, 3]
 arr.length = 2
 console.log(arr, 333)
 let currentYear = currentDate.getFullYear();

 console.log("Sum:", sum);
 console.log("Random Value:", randomValue);
 console.log("Current Year:", currentYear);
 console.log("toString:", sum.toString());
alert("111")
 // 条件语句
 if (sum > 7) {
   console.log("The sum is greater than 7");
 }

 // 循环
 for (let i = 0; i < 3; i++) {
   console.log("Loop iteration", i);
 }

 // 算术和逻辑运算
 let complexExpression = (a * b) / (a + b) && (randomValue > 0.5);
 console.log("Complex Expression Result:", complexExpression);
`;

// 使用 Babel 转译代码
// const transpiledCode = Babel.transform(script, {
//   presets: ['env'],
// }).code;
// console.log(transpiledCode, '转换');

// 创建上下文
const quickjs = await getQuickJS();
const ctx = quickjs.newContext();
// 3. 获取全局对象（如 globalThis）
const global = ctx.global;
// 4. 创建一个宿主函数，包装 window.alert
const alertFunction = ctx.newFunction("alert", (messageHandle) => {
  // 将 QuickJS 中的值转换为 JS 原始值
  const message = ctx.dump(messageHandle);
  // 安全处理：确保是字符串或可转字符串的类型
  window.alert(String(message));
});
// 5. 将 alert 函数挂载到沙箱的全局作用域
ctx.setProp(global, "alert", alertFunction);
// 6. ⚠️ 释放函数句柄（setProp 已增加引用，此处可安全释放）
alertFunction.dispose();

// 创建执行器
const evaluator = await createEvaluator(ctx);
evaluator.expose({
  console: {
    log: console.log
  }
});

evaluator.evalCode(script);
