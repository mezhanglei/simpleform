import { useRef } from "react";

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
