import { create } from 'zustand'
import type { ProxyStatus } from '@/services/types'
import { proxyService } from '@/services'

interface AppState {
  // 代理状态
  proxyStatus: ProxyStatus | null
  isRunning: boolean
  
  // 系统信息
  version: string
  buildTime: string
  
  // WebSocket 连接状态
  wsConnected: boolean
  
  // 加载状态
  loading: boolean
  error: string | null
  
  // Actions
  fetchProxyStatus: () => Promise<void>
  startProxy: () => Promise<void>
  stopProxy: () => Promise<void>
  setWsConnected: (connected: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  proxyStatus: null,
  isRunning: false,
  version: '',
  buildTime: '',
  wsConnected: false,
  loading: false,
  error: null,

  fetchProxyStatus: async () => {
    try {
      const data = await proxyService.getStatus()
      set({ 
        proxyStatus: {
          running: data.running,
          coreType: data.coreType as 'mihomo' | 'singbox',
          mode: data.mode as 'rule' | 'global' | 'direct',
          mixedPort: data.mixedPort,
          allowLan: data.allowLan ?? false,
        },
        isRunning: data.running,
      })
    } catch (error) {
      set({ proxyStatus: null, isRunning: false })
    }
  },

  startProxy: async () => {
    set({ loading: true, error: null })
    try {
      await proxyService.start()
      await get().fetchProxyStatus()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '启动失败' })
    } finally {
      set({ loading: false })
    }
  },

  stopProxy: async () => {
    set({ loading: true, error: null })
    try {
      await proxyService.stop()
      await get().fetchProxyStatus()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '停止失败' })
    } finally {
      set({ loading: false })
    }
  },

  setWsConnected: (connected) => set({ wsConnected: connected }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
}))
