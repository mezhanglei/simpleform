import { copy } from 'copy-anything';
import compare from 'react-fast-compare';

export function deepClone<T>(value: T) {
  return copy(value);
}

// 判断两个值是否相等
export function isEqual(a: unknown, b: unknown) {
  return compare(a, b);
}
