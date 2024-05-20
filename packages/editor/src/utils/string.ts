import { isEmpty } from './type';
import Clipboard from 'clipboard';
import * as devalue from 'devalue';

// 复制到剪贴板
export function copyToClipboard(content?: unknown, clickEvent?: Event, successFn?: () => void, errorFn?: () => void) {
  if (typeof content !== 'string') return;
  const el = clickEvent?.target as HTMLElement;
  const clipboard = new Clipboard(el, {
    text: () => content
  });

  clipboard.on('success', () => {
    successFn && successFn();
    clipboard.destroy();
  });

  clipboard.on('error', () => {
    errorFn && errorFn();
    clipboard.destroy();
  });

  (clipboard as any)?.onClick(clickEvent);
}

// 将对象转化为普通字符串(非json格式)
export function convertToString(val?: unknown, allowFunction: boolean = true): string | undefined {
  if (isEmpty(val)) return;
  if (typeof val === 'string') return val;
  if (typeof val === 'function') {
    if (allowFunction) {
      return val.toString();
    } else {
      return;
    }
  }
  try {
    return devalue.uneval(val);
  } catch (e) {
    console.error(e);
  }
}

// 将普通字符串转化为js(非json格式)
export function evalString<V>(val: string): V | undefined {
  if (isEmpty(val) || typeof val !== 'string') return;
  try {
    return eval(`(function(){return ${val} })()`);
  } catch (e) {
    console.error(e);
  }
}
