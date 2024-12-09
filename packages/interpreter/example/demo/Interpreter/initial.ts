// 对象构造函数
function ObjectFactory(proto) {
  this.getter = Object.create(null);
  this.setter = Object.create(null);
  this.properties = Object.create(null);
  this.proto = proto || null;
};

// 作用域构造函数
function ScopeFactory(parentScope, strict, object) {
  this.parentScope = parentScope; // 父级作用域
  this.strict = strict; // 是否严格模式
  this.object = object; // 作用域对象
};

// state构造函数
function StateFactory(node, scope) {
  this.node = node;
  this.scope = scope;
}

// Task构造函数
function TaskFactory(functionRef, argsArray, scope, node, interval, Interpreter) {
  this.functionRef = functionRef;
  this.argsArray = argsArray;
  this.scope = scope;
  this.node = node;

  this.interval = interval;
  this.pid = ++Interpreter.Task.pid;
  this.time = 0;
};

// 遍历所有的step开头的函数
function getStepFunctions(Factory, instance) {
  const data = Object.create(null);
  const attrs = Object.getOwnPropertyDescriptors(Factory.prototype);
  for (const methodName in attrs) {
    const methodFun = instance[methodName];
    const m = methodName.match(/^step([A-Z]\w*)$/);
    if (typeof methodFun === 'function' && m) {
      data[m[1]] = instance[methodName].bind(instance);
    }
  }
  return data;
}

// 递归遍历覆盖或删除节点的start, end属性
function stripLocations(node, start, end) {
  if (start) {
    node.start = start;
  } else {
    delete node.start;
  }
  if (end) {
    node.end = end;
  } else {
    delete node.end;
  }
  for (const name in node) {
    if (node[name] !== node.loc && node.hasOwnProperty(name)) {
      const prop = node[name];
      if (prop && typeof prop === 'object') {
        stripLocations(prop, start, end);
      }
    }
  }
}

const placeholderGet_ =
  function () { throw Error('Placeholder getter'); };
const placeholderSet_ =
  function () { throw Error('Placeholder setter'); };

export {
  ObjectFactory,
  ScopeFactory,
  StateFactory,
  TaskFactory,
  getStepFunctions,
  stripLocations,
  placeholderGet_,
  placeholderSet_,
};
