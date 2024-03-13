import React, { useEffect, useState } from 'react';
import { objectToFormData } from '../utils/object';

/**
 * 自动给目标组件某个数据来源字段绑定请求，默认该数据的字段为options
 * @param component 目标控件
 * @param codeStr 请求数据源的字段名
 * @returns 
 */

export default function bindRequest(component: any, codeStr: string = "options") {
  const Component = component;
  return React.forwardRef<any, any>(({ optionType, ...props }, ref) => {
    // 目标参数
    const target = props?.[codeStr];
    const formrender = props.formrender;
    const request = formrender.plugins && formrender.plugins.request;

    const [response, setResponse] = useState<any>([]);
    const [isRequest, setIsRequest] = useState<boolean>();

    useEffect(() => {
      handleRequest();
    }, []);

    const handleRequest = async () => {
      const {
        url,
        method,
        paramsType,
        params,
        headers,
        returnFn,
      } = target || {};
      if (method && url && request) {
        setIsRequest(true);
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

    const resultData = isRequest ? response : (target instanceof Array ? target : (props.children ? undefined : []));
    const params = resultData == undefined ? {} : { [codeStr]: resultData };
    return (
      <Component {...props} {...params} ref={ref} />
    );
  });
}
