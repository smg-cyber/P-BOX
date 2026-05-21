// WebSocket 消息类型
export type WsMessageType = 'traffic' | 'logs' | 'connections'

// WebSocket 消息
export interface WsMessage {
  type: WsMessageType
  data: unknown
}

// 回调函数类型
type MessageCallback = (data: unknown) => void

// WebSocket 管理器 - 单例模式
export class WebSocketManager {
  private static instance: WebSocketManager
  private connections: Map<WsMessageType, WebSocket> = new Map()
  private callbacks: Map<WsMessageType, Set<MessageCallback>> = new Map()
  private reconnectTimers: Map<WsMessageType, NodeJS.Timeout> = new Map()

  private constructor() {
    // 初始化回调集合
    this.callbacks.set('traffic', new Set())
    this.callbacks.set('logs', new Set())
    this.callbacks.set('connections', new Set())
  }

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  // 连接 WebSocket
  public connect(type: WsMessageType): void {
    if (this.connections.has(type)) {
      return
    }

    const wsUrl = this.getWsUrl(type)
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log(`WebSocket ${type} connected`)
      this.clearReconnectTimer(type)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.notifyCallbacks(type, data)
      } catch (error) {
        console.error(`WebSocket ${type} message parse error:`, error)
      }
    }

    ws.onerror = (error) => {
      console.error(`WebSocket ${type} error:`, error)
    }

    ws.onclose = () => {
      console.log(`WebSocket ${type} closed, reconnecting...`)
      this.connections.delete(type)
      this.scheduleReconnect(type)
    }

    this.connections.set(type, ws)
  }

  // 断开连接
  public disconnect(type: WsMessageType): void {
    this.clearReconnectTimer(type)
    
    const ws = this.connections.get(type)
    if (ws) {
      ws.close()
      this.connections.delete(type)
    }
  }

  // 断开所有连接
  public disconnectAll(): void {
    this.connections.forEach((_, type) => this.disconnect(type))
  }

  // 订阅消息
  public subscribe(type: WsMessageType, callback: MessageCallback): () => void {
    const cbSet = this.callbacks.get(type)
    if (!cbSet) {
      throw new Error(`Unknown message type: ${type}`)
    }

    cbSet.add(callback)
    
    // 如果还没连接，自动连接
    if (!this.connections.has(type)) {
      this.connect(type)
    }

    // 返回取消订阅函数
    return () => {
      cbSet.delete(callback)
    }
  }

  // 获取连接状态
  public isConnected(type: WsMessageType): boolean {
    const ws = this.connections.get(type)
    return ws?.readyState === WebSocket.OPEN
  }

  public getAllConnected(): boolean {
    const types: WsMessageType[] = ['traffic', 'logs', 'connections']
    return types.every(type => this.isConnected(type))
  }

  // 私有方法：获取 WebSocket URL
  private getWsUrl(type: WsMessageType): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}/ws/${type}`
  }

  // 私有方法：通知回调
  private notifyCallbacks(type: WsMessageType, data: unknown): void {
    const cbSet = this.callbacks.get(type)
    if (!cbSet) return

    cbSet.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`WebSocket ${type} callback error:`, error)
      }
    })
  }

  // 私有方法：安排重连
  private scheduleReconnect(type: WsMessageType): void {
    const timer = setTimeout(() => {
      console.log(`Attempting to reconnect WebSocket ${type}...`)
      this.connect(type)
    }, 3000)

    this.reconnect_timers.set(type, timer)
  }

  // 私有方法：清除重连计时器
  private clearReconnectTimer(type: WsMessageType): void {
    const timer = this.reconnectTimers.get(type)
    if (timer) {
      clearTimeout(timer)
      this.reconnectTimers.delete(type)
    }
  }
}

// 导出单例
export const wsManager = WebSocketManager.getInstance()
