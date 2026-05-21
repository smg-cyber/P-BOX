// 全局错误码定义
export enum ErrorCode {
  // 成功
  SUCCESS = 0,
  
  // 客户端错误 (4xx)
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  
  // 服务端错误 (5xx)
  INTERNAL_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  
  // 业务错误 (1000-1999)
  CORE_NOT_RUNNING = 1001,
  CORE_START_FAILED = 1002,
  CORE_STOP_FAILED = 1003,
  CONFIG_INVALID = 1004,
  SUBSCRIPTION_PARSE_FAILED = 1005,
  NODE_NOT_FOUND = 1006,
  RULESET_DOWNLOAD_FAILED = 1007,
  
  // 认证相关 (2000-2999)
  AUTH_DISABLED = 2000,
  INVALID_CREDENTIALS = 2001,
  TOKEN_EXPIRED = 2002,
  TOKEN_INVALID = 2003,
  PASSWORD_TOO_WEAK = 2004,
  
  // 系统相关 (3000-3999)
  SYSTEM_PROXY_FAILED = 3001,
  PERMISSION_DENIED = 3002,
  PORT_IN_USE = 3003,
  
  // 网络相关 (4000-4999)
  NETWORK_ERROR = 4001,
  TIMEOUT = 4002,
  CONNECTION_REFUSED = 4003,
}

// 错误消息映射
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.SUCCESS]: '操作成功',
  [ErrorCode.BAD_REQUEST]: '请求参数错误',
  [ErrorCode.UNAUTHORIZED]: '未授权，请先登录',
  [ErrorCode.FORBIDDEN]: '无权限访问',
  [ErrorCode.NOT_FOUND]: '资源不存在',
  [ErrorCode.METHOD_NOT_ALLOWED]: '请求方法不允许',
  [ErrorCode.CONFLICT]: '资源冲突',
  [ErrorCode.INTERNAL_ERROR]: '服务器内部错误',
  [ErrorCode.NOT_IMPLEMENTED]: '功能尚未实现',
  [ErrorCode.SERVICE_UNAVAILABLE]: '服务不可用',
  [ErrorCode.GATEWAY_TIMEOUT]: '网关超时',
  
  [ErrorCode.CORE_NOT_RUNNING]: '代理核心未运行',
  [ErrorCode.CORE_START_FAILED]: '启动代理核心失败',
  [ErrorCode.CORE_STOP_FAILED]: '停止代理核心失败',
  [ErrorCode.CONFIG_INVALID]: '配置文件无效',
  [ErrorCode.SUBSCRIPTION_PARSE_FAILED]: '解析订阅失败',
  [ErrorCode.NODE_NOT_FOUND]: '节点不存在',
  [ErrorCode.RULESET_DOWNLOAD_FAILED]: '下载规则集失败',
  
  [ErrorCode.AUTH_DISABLED]: '认证未启用',
  [ErrorCode.INVALID_CREDENTIALS]: '用户名或密码错误',
  [ErrorCode.TOKEN_EXPIRED]: '登录已过期，请重新登录',
  [ErrorCode.TOKEN_INVALID]: '令牌无效',
  [ErrorCode.PASSWORD_TOO_WEAK]: '密码强度不足',
  
  [ErrorCode.SYSTEM_PROXY_FAILED]: '设置系统代理失败',
  [ErrorCode.PERMISSION_DENIED]: '权限不足',
  [ErrorCode.PORT_IN_USE]: '端口已被占用',
  
  [ErrorCode.NETWORK_ERROR]: '网络错误',
  [ErrorCode.TIMEOUT]: '请求超时',
  [ErrorCode.CONNECTION_REFUSED]: '连接被拒绝',
}

// 获取错误消息
export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code] || `未知错误 (${code})`
}

// 业务错误类
export class BusinessError extends Error {
  constructor(
    public code: ErrorCode,
    public message?: string,
    public data?: unknown
  ) {
    super(message || getErrorMessage(code))
    this.name = 'BusinessError'
  }
  
  // 转换为友好提示
  toUserMessage(): string {
    if (this.message && this.message !== getErrorMessage(this.code)) {
      return this.message
    }
    return getErrorMessage(this.code)
  }
}
