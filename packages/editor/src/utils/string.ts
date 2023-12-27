import { isEmpty } from './type';
import Clipboard from 'clipboard';
import * as devalue from 'devalue';

// 复制到剪贴板
export function copyToClipboard(content: any, clickEvent: any, successFn?: () => void, errorFn?: () => void) {
  if (typeof content !== 'string') return;
  const clipboard = new Clipboard(clickEvent.target, {
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

  clipboard.onClick(clickEvent);
}

// 将对象转化为普通字符串(非json格式)
export function convertToString(val: any, allowFunction: boolean = true): string | undefined {
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
export function evalString(val: string) {
  if (isEmpty(val) || typeof val !== 'string') return;
  try {
    return eval(`(function(){return ${val} })()`);
  } catch (e) {
    console.error(e);
  }
}
