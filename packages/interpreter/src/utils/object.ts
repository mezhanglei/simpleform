// 绑定类中的方法
const bindClassPrototype = (Factory, instance) => {
  const attrs = Object.getOwnPropertyDescriptors(Factory?.prototype);
  for (const key in attrs) {
    const attr = instance[key];
    if (typeof attr === 'function' && key !== 'constructor') {
      instance[key] = instance[key].bind(instance);
    }
  }
};

// 增加属性
function assignProperty<V>(obj, ...args) {
  args?.forEach((item) => {
    for (const name in item) {
      obj[name] = item[name] instanceof Array ? item[name].slice() : item[name];
    }
  });
  return obj as V;
}

// 在原型链中查找属性
function getPropInPrototypeChain(obj, name) {
  while (obj !== null) {
    if (obj.properties && name in obj.properties) {
      return obj.properties[name];
    }
    obj = obj.proto;
  }
}

// Is an object of a certain class?
function isa(child, constructor) {
  if (child === null || child === undefined || !constructor) {
    return false;
  }
  const prototype = constructor.properties['prototype'];
  if (child === prototype) {
    return true;
  }
  // 伪类型
  if (typeof child === 'object') {
    let childProto = child?.proto;
    while (childProto) {
      if (childProto === prototype) {
        return true;
      }
      childProto = childProto.proto;
    }
    return false;
  } else {
    // 原子类型
    return (constructor.nativeFunc.name).toLowerCase() === typeof child;
  }
};

const placeholderGet_ =
  function () { throw Error('Placeholder getter'); };
const placeholderSet_ =
  function () { throw Error('Placeholder setter'); };

export {
  bindClassPrototype,
  assignProperty,
  isa,
  getPropInPrototypeChain,
  placeholderGet_,
  placeholderSet_,
};
