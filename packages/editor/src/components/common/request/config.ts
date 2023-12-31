// ===AXIOS请求的配置信息=== //

import { InternalAxiosRequestConfig, Canceler } from "axios";

export enum MESSAGE {
  SUCCESS = '更新成功',
  DELETE = '删除成功',
  ADD = '添加成功',
  CREATE = '创建成功',
  CLOSE = '关闭成功',
  SUBMIT = '提交成功',
  ERROR = '网络异常，请稍后重试',
  FAIL = '请求失败，请稍后重试'
};

// 返回status
export enum HTTP_STATUS {
  NOLOGIN = 401,
  AUTH = 403,
  NONE = 404,
  WAY_ERROR = 405,
  TIMEOUT = 408,
  NET_ERROR = 502,
  NOUSE = 503,
  GATEWAY_TIMEOUT = 504,
  VERSION_ERROR = 505
}
// status状态码
export const HTTP_STATUS_MAP = {
  401: "请登录账号",
  403: "账号权限已过期",
  404: "资源不存在",
  405: "请求方法错误",
  408: "请求超时",
  502: "网关错误，请稍后再试",
  503: "服务不可用",
  504: "网关超时",
  505: "http版本不支持"
};

// 返回code
export enum HTTP_CODE {
  SUCCESS = 200,
  NOLOGIN = 401,
  AUTH = 403
}
export const HTTP_CODE_MAP = {
  401: "请登录账号",
  403: "无访问权限"
};

// 取消操作池
export interface CancelPending {
  key: string
  cancel: Canceler
}
// axios config
export interface CustomConfig extends InternalAxiosRequestConfig {
  trim?: boolean // 去除空格
  unique?: boolean // 去除重复请求
  withResponse?: boolean; // 返回值是否携带请求体
};
