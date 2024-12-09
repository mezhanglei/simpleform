import Interpreter from './Interpreter/index';
// 使用解释器执行一段包含多种操作和自定义变量的脚本
const script = `
 console.log("Custom variable 1:", customVar1);
 console.log("Custom variable 2:", customVar2);

 let result = myFunction(customVar1);
 console.log("Result of myFunction(customVar1):", result);

 let a = 3;
 let b = 5;
 let sum = a + b;
 let randomValue = Math.random();
 let currentDate = new Date();
 let currentYear = currentDate.getFullYear();

 console.log("Sum:", sum);
 console.log("Random Value:", randomValue);
 console.log("Current Year:", currentYear);

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

 // 返回最后一个表达式的值
 complexExpression;
`;

var myInterpreter = new Interpreter('1+1');
myInterpreter.run();
alert(myInterpreter.value);
