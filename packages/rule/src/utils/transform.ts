// 递归遍历数据结构
export const traverseTree = <V>(
  list?: Array<V>,
  callback?: <R>(
    item: any,
    index: number,
    path?: Array<string | number>
  ) => R | void,
  parent?: Array<string | number>
) => {
  if (!(list instanceof Array)) return;
  list.forEach((item: any, index) => {
    const children = item?.children;
    const curPath = (parent || []).concat(index);
    callback?.(item, index, curPath);
    if (children instanceof Array) {
      const conjunction = item?.properties?.conjunction;
      traverseTree(children, callback, curPath.concat(conjunction));
    }
  });
};
