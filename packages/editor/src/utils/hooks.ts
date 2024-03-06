import { useEffect, useMemo, useRef, useState } from "react";
import { deepSet } from "../components/formrender";
import EventBus from "./event-bus";
import { useEditorContext } from "../context";


export function useEventBus() {
  return useMemo(() => new EventBus(), []);
}

// 处理列表型的数据
export function useTableData<T = any>(intialValue?: T[], onChange?: (data: T[]) => void) {
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
  const updateItem = (data: any, rowIndex: number, path?: string) => {
    const oldData = dataSourceRef.current;
    const cloneData = oldData ? [...oldData] : [];
    let item = cloneData?.[rowIndex] ?? {};
    if (path) {
      cloneData[rowIndex] = deepSet(item, path, data);
    } else {
      cloneData[rowIndex] = data;
    }
    setDataSource(cloneData);
    dataChange(cloneData);
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

// 监听eventBus的值
export function useEventBusValue<T = any>(type: string) {
  const context = useEditorContext();
  const { eventBus } = context?.state || {};
  const dataRef = useRef<T>();

  useEffect(() => {
    eventBus && eventBus.on(type, (val: T) => {
      dataRef.current = val;
    });
    return () => {
      eventBus && eventBus.remove(type);
    };
  }, []);

  return dataRef;
}
