// Legacy API exports (保持向后兼容)
export { default as client, api } from './client'
export * from './proxy'
export * from './subscription'
export * from './node'
export * from './core'
export * from './system'
export * from './auth'
export * from './mihomo'

// New service layer (推荐使用)
export * from '../services'
export { wsManager } from '../utils/websocket'
export type { WsMessageType, WsMessage } from '../utils/websocket'
