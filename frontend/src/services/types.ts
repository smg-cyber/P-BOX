// API 响应基础类型
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// 错误响应
export interface ApiError {
  code: number
  message: string
}

// 分页参数
export interface PaginationParams {
  page?: number
  pageSize?: number
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 节点类型
export interface ProxyNode {
  name: string
  type: string
  server: string
  serverPort: number
  isManual: boolean
  config: Record<string, unknown>
}

// 代理状态
export interface ProxyStatus {
  running: boolean
  coreType: 'mihomo' | 'singbox'
  mode: 'rule' | 'global' | 'direct'
  mixedPort: number
  allowLan: boolean
}

// 订阅信息
export interface Subscription {
  id: string
  name: string
  url: string
  nodes: ProxyNode[]
  updatedAt?: string
}

// 连接信息
export interface Connection {
  id: string
  metadata: {
    network: string
    type: string
    sourceIP: string
    sourcePort: string
    destinationIP: string
    destinationPort: string
    host: string
    dnsMode: string
    process: string
    processPath: string
    specialProxy: string
    specialRules: string
    remoteDestination: string
    sniffHost: string
  }
  upload: number
  download: number
  start: string
  chains: string[]
  rule: string
  rulePayload: string
}

// 流量统计
export interface TrafficStats {
  up: number
  down: number
}

// 日志条目
export interface LogEntry {
  type: string
  time: string
  payload: string
}
