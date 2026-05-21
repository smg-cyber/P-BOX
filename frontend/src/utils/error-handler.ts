// API 错误处理增强
import { ErrorCode, ERROR_MESSAGES, BusinessError } from '@/constants/errors'
import type { ApiResponse } from '@/services/types'

// 扩展 ApiResponse 类型包含错误码
export interface ApiResponseWithError<T = unknown> extends ApiResponse<T> {
  errorCode?: ErrorCode
}

// 增强的错误处理
export function handleApiErrorEnhanced(error: unknown): BusinessError {
  // 已经是 BusinessError
  if (error instanceof BusinessError) {
    return error
  }
  
  // Axios 错误
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as Record<string, unknown>
    const response = axiosError.response as Record<string, unknown> | undefined
    
    if (response?.status === 401) {
      return new BusinessError(
        ErrorCode.UNAUTHORIZED,
        '登录已过期，请重新登录'
      )
    }
    
    if (response?.status === 403) {
      return new BusinessError(
        ErrorCode.FORBIDDEN,
        '无权限访问该资源'
      )
    }
    
    if (response?.status === 404) {
      return new BusinessError(
        ErrorCode.NOT_FOUND,
        '请求的资源不存在'
      )
    }
    
    if (response?.status === 503) {
      return new BusinessError(
        ErrorCode.SERVICE_UNAVAILABLE,
        '服务暂时不可用'
      )
    }
    
    // 从响应数据获取错误码
    const data = response?.data as Record<string, unknown> | undefined
    if (data?.code && typeof data.code === 'number') {
      const errorCode = data.code as ErrorCode
      return new BusinessError(
        errorCode,
        (data.message as string) || ERROR_MESSAGES[errorCode]
      )
    }
  }
  
  // 超时错误
  if (error && typeof error === 'object' && 'code' in error) {
    const err = error as Record<string, unknown>
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      return new BusinessError(
        ErrorCode.TIMEOUT,
        '请求超时，请检查网络连接'
      )
    }
  }
  
  // 网络断开
  if (!navigator.onLine) {
    return new BusinessError(
      ErrorCode.NETWORK_ERROR,
      '网络连接已断开'
    )
  }
  
  // 默认错误
  return new BusinessError(
    ErrorCode.INTERNAL_ERROR,
    error instanceof Error ? error.message : '操作失败'
  )
}

// 增强的请求包装器
export async function requestEnhanced<T>(
  fn: () => Promise<T>,
  defaultMessage?: string
): Promise<T> {
  try {
    const result = await fn()
    
    // 检查业务错误码
    const resp = result as ApiResponseWithError<T>
    if (resp.code !== undefined && resp.code !== ErrorCode.SUCCESS) {
      const errorCode = resp.errorCode ?? (resp.code as ErrorCode)
      throw new BusinessError(
        errorCode,
        resp.message || ERROR_MESSAGES[errorCode]
      )
    }
    
    return result as T
  } catch (error) {
    const businessError = handleApiErrorEnhanced(error)
    throw businessError
  }
}

// 统一错误提示（可配合 sonner/toast 使用）
export function showErrorToast(error: unknown, customMessage?: string) {
  const businessError = handleApiErrorEnhanced(error)
  const message = customMessage || businessError.toUserMessage()
  
  // 这里可以集成 sonner
  // toast.error(message)
  console.error('[API Error]', businessError.code, message)
  
  return message
}

// 错误恢复建议
export const ERROR_RECOVERY_SUGGESTIONS: Record<ErrorCode, string | undefined> = {
  [ErrorCode.UNAUTHORIZED]: '请点击登录按钮重新登录',
  [ErrorCode.TIMEOUT]: '请检查网络连接后重试',
  [ErrorCode.NETWORK_ERROR]: '请检查网络设置',
  [ErrorCode.CORE_NOT_RUNNING]: '请先启动代理核心',
  [ErrorCode.PORT_IN_USE]: '请关闭占用端口的程序或更换端口',
  [ErrorCode.PERMISSION_DENIED]: '请以管理员权限运行',
}

export function getRecoverySuggestion(code: ErrorCode): string | undefined {
  return ERROR_RECOVERY_SUGGESTIONS[code]
}
