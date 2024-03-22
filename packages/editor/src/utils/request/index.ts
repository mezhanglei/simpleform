import CreateRequest, { CreateRequestParams } from './createRequest';
import { HTTP_CODE, HTTP_CODE_MAP, HTTP_STATUS, HTTP_STATUS_MAP } from './config';
import { message } from 'antd';

// 请求体结构
export interface ResponseData {
  code?: HTTP_CODE;
  message?: string;
}

// 初始化请求
const createRequest = (props?: CreateRequestParams) => {
  const request = CreateRequest({
    startLoading: () => {
    },
    endLoading: () => {
    },
    // 处理响应码
    handleResult: (data: ResponseData) => {
      const code = data?.code;
      const msg = data?.message;
      if (code != HTTP_CODE.SUCCESS && code) {
        const msgRes = msg || HTTP_CODE_MAP[code];
        msgRes && message.info(msgRes);
      }
    },
    // 处理状态码
    handleStatus: (status, msg) => {
      if (status == HTTP_STATUS.AUTH) {
        // loginOut();
      }
      const msgRes = msg || HTTP_STATUS_MAP[status];
      msgRes && message.info(msgRes);
    },
    ...props
  });
  return request;
};

export default createRequest;
