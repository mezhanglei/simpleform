import Interpreter from '../../src';
import * as Babel from '@babel/standalone';
// 使用解释器执行一段包含多种操作和自定义变量的脚本
const script = `
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
`;

const script1 = 'customVar1 + "--" + customVar2 + "---" + robot.fast';

var initFunc = function (interpreter, globalObject) {
  interpreter.setProperty(globalObject, 'customVar1', 'customVar1');
  interpreter.setProperty(globalObject, 'customVar2', 'customVar2');
  // Create 'robot' global object.
  var robot = interpreter.nativeToPseudo({log: window.console.log});
  interpreter.setProperty(globalObject, 'console', robot);
  // Define 'robot.fast' property.
  // interpreter.setProperty(robot, 'fast', 99);
};

// 使用 Babel 转译代码
const transpiledCode = Babel.transform(script, {
  presets: ['env'],
}).code;
console.log(transpiledCode, '转换');
var myInterpreter = new Interpreter(transpiledCode, initFunc);
myInterpreter.run();
console.log(myInterpreter.value, '如果是表达式则返回值');
