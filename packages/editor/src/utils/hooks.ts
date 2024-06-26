import { useRef, useState } from "react";
import { deepSet } from "../formrender";

export function useMethod<T extends (...args: unknown[]) => unknown>(method: T) {
  const { current } = useRef<{ method: T, func: T | undefined }>({
    method,
    func: undefined,
  });
  current.method = method;

  // 只初始化一次
  if (!current.func) {
    // 返回给使用方的变量
    current.func = ((...args: unknown[]) => current.method.call(current.method, ...args)) as T;
  }

  return current.func;
}

// 处理列表型的数据
export function useTableData<T>(intialValue?: T[], onChange?: (data: T[]) => void) {
  const [dataSource, setData] = useState<T[]>(intialValue || []);
  const dataSourceRef = useRef<T[]>(intialValue || []);

  const setDataSource = (data: T[]) => {
    if (data instanceof Array) {
      setData(data);
      dataSourceRef.current = data;
    }
  };

  // onChange事件
  const dataChange = (data: T[]) => {
    onChange && onChange(data);
  };

  // 更新目标数据
  const updateItem = (data: unknown, rowIndex: number, path?: string) => {
    const oldData = dataSourceRef.current;
    const cloneData = oldData ? [...oldData] : [] as unknown[];
    let item = cloneData?.[rowIndex] ?? {};
    if (path) {
      cloneData[rowIndex] = deepSet(item, path, data);
    } else {
      cloneData[rowIndex] = data;
    }
    setDataSource(cloneData as T[]);
    dataChange(cloneData as T[]);
  };

  // 新增一行
  const addItem = (data: T[]) => {
    const oldData = dataSourceRef.current;
    const newData = oldData?.concat(data);
    setDataSource(newData);
  };

  // 删除一行
  const deleteItem = (rowIndex: number) => {
    const oldData = dataSourceRef.current;
    if (!oldData) return;
    const newData = [...oldData];
    newData.splice(rowIndex, 1);
    setDataSource(newData);
    dataChange(newData);
  };

  return {
    updateItem,
    addItem,
    deleteItem,
    dataSource,
    setDataSource
  };
}
