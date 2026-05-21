import { useState, useCallback } from 'react'

interface UseRulesetOptions {
  apiBase?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseRulesetReturn<T> {
  data: T[]
  loading: boolean
  error: string | null
  refreshing: boolean
  refresh: () => Promise<void>
  updateItem: (name: string, fields: Partial<T>) => void
  removeItem: (name: string) => void
}

// 通用 Ruleset Hook
export function useRuleset<T extends { name: string; status: string }>(
  endpoint: string,
  options: UseRulesetOptions = {}
): UseRulesetReturn<T> {
  const {
    apiBase = '/api',
    autoRefresh = true,
    refreshInterval = 3000,
  } = options

  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}${endpoint}`)
      const result = await res.json()
      
      if (result.code === 0) {
        setData(result.data || [])
        setError(null)
      } else {
        setError(result.message || '加载失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误')
    } finally {
      setLoading(false)
    }
  }, [apiBase, endpoint])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await loadData()
    } finally {
      setRefreshing(false)
    }
  }, [loadData])

  const updateItem = useCallback((name: string, fields: Partial<T>) => {
    setData(prev => prev.map(item => 
      item.name === name ? { ...item, ...fields } : item
    ))
  }, [])

  const removeItem = useCallback((name: string) => {
    setData(prev => prev.filter(item => item.name !== name))
  }, [])

  // 自动刷新
  useState(() => {
    if (!autoRefresh) return
    
    loadData()
    const interval = setInterval(() => {
      const statusEndpoint = endpoint.replace(/s$/, '/status')
      fetch(`${apiBase}${statusEndpoint}`)
        .then(r => r.json())
        .then(d => {
          if (!d.data?.updating) {
            loadData()
          }
        })
        .catch(() => {})
    }, refreshInterval)

    return () => clearInterval(interval)
  })

  return {
    data,
    loading,
    error,
    refreshing,
    refresh,
    updateItem,
    removeItem,
  }
}

// 通用配置管理 Hook
interface UseRulesetConfig<T> {
  config: T
  loading: boolean
  saving: boolean
  loadConfig: () => Promise<void>
  saveConfig: (config: Partial<T>) => Promise<void>
}

export function useRulesetConfig<T extends Record<string, unknown>>(
  endpoint: string,
  options: { apiBase?: string } = {}
): UseRulesetConfig<T> {
  const { apiBase = '/api' } = options
  const [config, setConfig] = useState<T>({} as T)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}${endpoint}`)
      const result = await res.json()
      if (result.code === 0) {
        setConfig(result.data || {})
      }
    } catch (err) {
      console.error('Load config failed:', err)
    } finally {
      setLoading(false)
    }
  }, [apiBase, endpoint])

  const saveConfig = useCallback(async (newConfig: Partial<T>) => {
    setSaving(true)
    try {
      const res = await fetch(`${apiBase}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      })
      const result = await res.json()
      if (result.code === 0) {
        setConfig(prev => ({ ...prev, ...newConfig } as T))
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      console.error('Save config failed:', err)
      throw err
    } finally {
      setSaving(false)
    }
  }, [apiBase, endpoint])

  return {
    config,
    loading,
    saving,
    loadConfig,
    saveConfig,
  }
}
