import api from '@/api/client'
import type { ApiResponse } from './types'

// 统一错误处理
export function handleApiError(error: unknown, defaultMessage = '操作失败'): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message
  }
  return defaultMessage
}

// 通用请求包装器
export async function request<T>(
  fn: () => Promise<T>,
  defaultMessage = '操作失败'
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    throw new Error(handleApiError(error, defaultMessage))
  }
}

// 认证服务
export const authService = {
  check: () => 
    request<ApiResponse<{ enabled: boolean; authenticated: boolean }>>(
      () => api.get('/auth/check'),
      '检查认证状态失败'
    ),

  login: (username: string, password: string) =>
    request<ApiResponse<{ token: string; username: string; avatar: string }>>(
      () => api.post('/auth/login', { username, password }),
      '登录失败'
    ),

  logout: () =>
    request<ApiResponse<{ message: string }>>(
      () => api.post('/auth/logout'),
      '登出失败'
    ),

  updatePassword: (oldPassword: string, newPassword: string) =>
    request<ApiResponse<{ message: string }>>(
      () => api.put('/auth/password', { oldPassword, newPassword }),
      '更新密码失败'
    ),

  updateUsername: (username: string) =>
    request<ApiResponse<{ message: string }>>(
      () => api.put('/auth/username', { username }),
      '更新用户名失败'
    ),
}

// 系统服务
export const systemService = {
  getInfo: () =>
    request<ApiResponse<{ name: string; version: string; buildTime: string }>>(
      () => api.get('/system/info'),
      '获取系统信息失败'
    ),

  getSystemProxy: () =>
    request<ApiResponse<{ enabled: boolean }>>(
      () => api.get('/system/proxy'),
      '获取系统代理状态失败'
    ),

  enableSystemProxy: () =>
    request<ApiResponse<{ message: string }>>(
      () => api.post('/system/proxy/enable'),
      '启用系统代理失败'
    ),

  disableSystemProxy: () =>
    request<ApiResponse<{ message: string }>>(
      () => api.post('/system/proxy/disable'),
      '禁用系统代理失败'
    ),
}

// 核心管理服务
export const coreService = {
  getCoreInfo: () =>
    request<ApiResponse<{ version: string; type: string; available: boolean }>>(
      () => api.get('/core/info'),
      '获取核心信息失败'
    ),

  checkUpdate: () =>
    request<ApiResponse<{ latest: string; current: string; needUpdate: boolean }>>(
      () => api.get('/core/update/check'),
      '检查更新失败'
    ),

  downloadCore: (version?: string) =>
    request<ApiResponse<{ message: string }>>(
      () => api.post('/core/download', version ? { version } : undefined),
      '下载核心失败'
    ),

  switchCore: (type: 'mihomo' | 'singbox') =>
    request<ApiResponse<{ message: string }>>(
      () => api.post('/core/switch', { type }),
      '切换核心失败'
    ),
}

// 订阅服务
export const subscriptionService = {
  list: () =>
    request<ApiResponse<Array<{ id: string; name: string; url: string; nodeCount: number; updatedAt: string }>>>(
      () => api.get('/subscriptions'),
      '获取订阅列表失败'
    ),

  add: (name: string, url: string) =>
    request<ApiResponse<{ id: string; message: string }>>(
      () => api.post('/subscriptions', { name, url }),
      '添加订阅失败'
    ),

  update: (id: string, name?: string, url?: string) =>
    request<ApiResponse<{ message: string }>>(
      () => api.put(`/subscriptions/${id}`, { name, url }),
      '更新订阅失败'
    ),

  delete: (id: string) =>
    request<ApiResponse<{ message: string }>>(
      () => api.delete(`/subscriptions/${id}`),
      '删除订阅失败'
    ),

  refresh: (id: string) =>
    request<ApiResponse<{ message: string }>>(
      () => api.post(`/subscriptions/${id}/refresh`),
      '刷新订阅失败'
    ),
}

// 节点服务
export const nodeService = {
  list: (subscriptionId?: string) =>
    request<ApiResponse<Array<{ name: string; type: string; server: string; serverPort: number }>>>(
      () => api.get('/nodes', { params: { subscriptionId } }),
      '获取节点列表失败'
    ),

  add: (config: string) =>
    request<ApiResponse<{ message: string }>>(
      () => api.post('/nodes', { config }),
      '添加节点失败'
    ),

  delete: (name: string) =>
    request<ApiResponse<{ message: string }>>(
      () => api.delete(`/nodes/${encodeURIComponent(name)}`),
      '删除节点失败'
    ),

  speedTest: (name?: string) =>
    request<ApiResponse<{ message: string }>>(
      () => api.post('/nodes/speedtest', name ? { name } : undefined),
      '速度测试失败'
    ),
}

// 代理服务
export const proxyService = {
  getStatus: () =>
    request<ApiResponse<{ running: boolean; coreType: string; mode: string; mixedPort: number }>>(
      () => api.get('/proxy/status'),
      '获取代理状态失败'
    ),

  start: () =>
    request<ApiResponse<{ message: string }>>(
      () => api.post('/proxy/start'),
      '启动代理失败'
    ),

  stop: () =>
    request<ApiResponse<{ message: string }>>(
      () => api.post('/proxy/stop'),
      '停止代理失败'
    ),

  restart: () =>
    request<ApiResponse<{ message: string }>>(
      () => api.post('/proxy/restart'),
      '重启代理失败'
    ),

  getGroups: () =>
    request<ApiResponse<Array<{ name: string; type: string; now: string; all: string[] }>>>(
      () => api.get('/proxy/groups'),
      '获取代理组失败'
    ),

  selectGroup: (groupName: string, nodeName: string) =>
    request<ApiResponse<{ message: string }>>(
      () => api.put(`/proxy/groups/${encodeURIComponent(groupName)}`, { nodeName }),
      '切换代理节点失败'
    ),

  getProviders: () =>
    request<ApiResponse<Array<{ name: string; proxies: Array<{ name: string }> }>>>(
      () => api.get('/proxy/providers'),
      '获取代理提供者失败'
    ),

  updateProviders: () =>
    request<ApiResponse<{ message: string }>>(
      () => api.put('/proxy/providers'),
      '更新代理提供者失败'
    ),
}

// 日志服务
export const logService = {
  getRecent: (limit = 100) =>
    request<ApiResponse<Array<{ type: string; time: string; payload: string }>>>(
      () => api.get('/logs', { params: { limit } }),
      '获取日志失败'
    ),

  clear: () =>
    request<ApiResponse<{ message: string }>>(
      () => api.delete('/logs'),
      '清空日志失败'
    ),
}

// 连接服务
export const connectionService = {
  list: () =>
    request<ApiResponse<{ connections: Array<Record<string, unknown>> }>>(
      () => api.get('/connections'),
      '获取连接列表失败'
    ),

  close: (id: string) =>
    request<ApiResponse<{ message: string }>>(
      () => api.delete(`/connections/${encodeURIComponent(id)}`),
      '关闭连接失败'
    ),

  closeAll: () =>
    request<ApiResponse<{ message: string }>>(
      () => api.delete('/connections'),
      '关闭所有连接失败'
    ),
}
