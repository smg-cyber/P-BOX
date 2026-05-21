import { useRef, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface VirtualListProps<T> {
  data: T[]
  itemHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  containerHeight?: number
  overscan?: number
}

export function VirtualList<T>({
  data,
  itemHeight,
  renderItem,
  className,
  containerHeight = 400,
  overscan = 5,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const totalHeight = data.length * itemHeight
  
  const [startIndex, endIndex] = useMemo(() => {
    const container = containerRef.current
    if (!container) return [0, overscan * 2]
    
    const scrollTop = container.scrollTop
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const end = Math.min(data.length, start + visibleCount + overscan * 2)
    
    return [start, end]
  }, [data.length, itemHeight, containerHeight, overscan])
  
  const visibleData = useMemo(
    () => data.slice(startIndex, endIndex),
    [data, startIndex, endIndex]
  )
  
  const paddingTop = startIndex * itemHeight
  const paddingBottom = (data.length - endIndex) * itemHeight
  
  return (
    <div 
      ref={containerRef}
      className={cn('overflow-y-auto', className)}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            paddingTop,
            paddingBottom,
          }}
        >
          {visibleData.map((item, index) => (
            <div
              key={index}
              style={{ height: itemHeight }}
              className="border-b border-border last:border-b-0"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface VirtualTableProps<T> {
  data: T[]
  columns: Array<{
    key: string
    title: string
    width?: string | number
    render?: (item: T, index: number) => React.ReactNode
  }>
  itemHeight?: number
  className?: string
  containerHeight?: number
}

export function VirtualTable<T>({
  data,
  columns,
  itemHeight = 48,
  className,
  containerHeight = 400,
}: VirtualTableProps<T>) {
  return (
    <div className={cn('border border-border rounded-md', className)}>
      {/* Table Header */}
      <div className="flex bg-muted/50 font-medium border-b border-border sticky top-0">
        {columns.map((col) => (
          <div
            key={col.key}
            className="p-3 truncate"
            style={{ 
              width: col.width,
              flex: col.width ? undefined : 1,
            }}
          >
            {col.title}
          </div>
        ))}
      </div>
      
      {/* Virtual List */}
      <VirtualList
        data={data}
        itemHeight={itemHeight}
        containerHeight={containerHeight}
        renderItem={(item, index) => (
          <div className="flex hover:bg-accent/50 transition-colors">
            {columns.map((col) => (
              <div
                key={col.key}
                className="p-3 truncate flex items-center"
                style={{ 
                  width: col.width,
                  flex: col.width ? undefined : 1,
                }}
              >
                {col.render ? col.render(item, index) : (item as Record<string, unknown>)[col.key]}
              </div>
            ))}
          </div>
        )}
      />
    </div>
  )
}
