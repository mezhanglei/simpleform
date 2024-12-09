const bindClassPrototype = (Factory, instance) => {
  const attrs = Object.getOwnPropertyDescriptors(Factory?.prototype);
  for (const key in attrs) {
    const attr = instance[key];
    if (typeof attr === 'function' && key !== 'constructor') {
      instance[key] = instance[key].bind(instance);
    }
  }
};

function cloneObject<V>(...args) {
  const cloneData = {};
  args?.forEach((item) => {
    for (const name in item) {
      cloneData[name] = item[name] instanceof Array ? item[name].slice() : item[name];
    }
  });
  return cloneData as V;
}

// 遍历返回ast节点的声明标识符（变量/函数）
function traverseAstDeclar(node, callback) {
  let variableCache;
  if (!node.variableCache_) {
    variableCache = Object.create(null);
    switch (node.type) {
      case 'VariableDeclaration':
        for (let i = 0; i < node.declarations.length; i++) {
          variableCache[node.declarations[i].id.name] = true;
        }
        break;
      case 'FunctionDeclaration':
        variableCache[node.id.name] = node;
        break;
      case 'BlockStatement':
      case 'CatchClause':
      case 'DoWhileStatement':
      case 'ForInStatement':
      case 'ForStatement':
      case 'IfStatement':
      case 'LabeledStatement':
      case 'Program':
      case 'SwitchCase':
      case 'SwitchStatement':
      case 'TryStatement':
      case 'WithStatement':
      case 'WhileStatement':
        // 节点构造函数
        const nodeClass = node.constructor;
        for (const name in node) {
          if (name === 'loc') continue; // 忽略位置节点信息
          const prop = node[name];
          if (prop && typeof prop === 'object') {
            let childCache;
            if (Array.isArray(prop)) {
              for (let i = 0; i < prop.length; i++) {
                // 找到变量所在节点
                if (prop[i] && prop[i].constructor === nodeClass) {
                  childCache = traverseAstDeclar(prop[i], callback);
                  for (const name in childCache) {
                    variableCache[name] = childCache[name];
                  }
                }
              }
            } else {
              // 变量声明节点
              if (prop.constructor === nodeClass) {
                childCache = traverseAstDeclar(prop, callback);
                for (const name in childCache) {
                  variableCache[name] = childCache[name];
                }
              }
            }
          }
        }
    }
    node.variableCache_ = variableCache;
  } else {
    variableCache = node.variableCache_;
  }
  callback?.(variableCache);
  return variableCache;
}

function legalArrayIndex(x) {
  var n = x >>> 0;
  // Array index cannot be 2^32-1, otherwise length would be 2^32.
  // 0xffffffff is 2^32-1.
  return (String(n) === String(x) && n !== 0xffffffff) ? n : NaN;
};

function legalArrayLength(x) {
  var n = x >>> 0;
  // Array length must be between 0 and 2^32-1 (inclusive).
  return (n === Number(x)) ? n : NaN;
};

export {
  bindClassPrototype,
  cloneObject,
  traverseAstDeclar,
  legalArrayIndex,
  legalArrayLength,
};
