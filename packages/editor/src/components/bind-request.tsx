import React, { useEffect, useState } from 'react';
import { objectToFormData } from '../utils/object';
import { isEmpty, isObject } from '../utils/type';

/**
 * 自动给目标组件某个数据来源字段绑定请求，默认该数据的字段为options
 * @param component 目标控件
 * @param codeStr 请求数据源的字段名
 * @returns 
 */

export default function bindRequest(component: any, codeStr: string = "options") {
  const Component = component;
  return React.forwardRef<any, any>(({ optionsType, ...props }, ref) => {
    // 目标参数
    const target = props?.[codeStr];
    // 是否为配置请求
    const isRequest = isObject(target) ? true : false;
    const formrender = props.formrender;
    const request = formrender.plugins && formrender.plugins.request;

    const [response, setResponse] = useState<any>();

    useEffect(() => {
      getRequest();
    }, []);

    const getRequest = async () => {
      const {
        url,
        method,
        paramsType,
        params,
        headers,
        returnFn,
      } = target || {};
      if (method && url && request) {
        const paramsKey = ['get', 'delete'].includes(method) ? 'params' : 'data';
        const data = paramsType === 'formdata' ? objectToFormData(params) : params;
        const result = await request(url, {
          method: method,
          [paramsKey]: data,
          headers,
        });
        const formatRes = typeof returnFn == 'function' ? returnFn(result) : result;
        setResponse(formatRes);
      }
    };

    const emptyResult = props.children ? undefined : []; // 空值逻辑
    const resultData = isRequest ? (target?.url && codeStr ? response : emptyResult) : (target instanceof Array ? target : emptyResult);
    const params = resultData == undefined ? {} : { [codeStr]: resultData };

    return (
      <Component {...props} {...params} ref={ref} />
    );
  });
}