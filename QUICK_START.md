# P-BOX 优化快速参考

## 安全升级

### 🔐 密码哈希（bcrypt）
```bash
# 后端自动处理，无需操作
# 用户下次登录时自动升级
```

### 🌐 CORS 配置
```go
// backend/server/server.go
// 生产环境修改这里
allowedHosts := []string{"https://your-domain.com"}
```

---

## 前端开发

### ✨ 使用新服务层
```typescript
// 推荐：使用服务层
import { proxyService, authService } from '@/services'

const status = await proxyService.getStatus()
await authService.login('admin', 'password')

// 旧方式（仍支持）
import { proxyApi } from '@/api'
const status = await proxyApi.getStatus()
```

### 📡 WebSocket 连接
```typescript
import { wsManager } from '@/utils/websocket'

// 订阅流量数据
const unsub = wsManager.subscribe('traffic', (data) => {
  console.log('Up:', data.up, 'Down:', data.down)
})

// 取消订阅
unsub()

// 检查连接状态
if (wsManager.isConnected('traffic')) {
  // 已连接
}
```

### 🎨 使用 Dialog 组件
```tsx
import { Dialog } from '@/components/ui'

<Dialog 
  open={isOpen} 
  onOpenChange={setOpen} 
  title="添加订阅"
  description="请输入订阅信息"
>
  <DialogContent>
    <form>...</form>
  </DialogContent>
  <DialogFooter>
    <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
    <Button onClick={handleSubmit}>确定</Button>
  </DialogFooter>
</Dialog>
```

### 📊 大数据列表优化
```tsx
import { VirtualList } from '@/components/ui'

<VirtualList
  data={nodes} // 500+ 节点
  itemHeight={60}
  containerHeight={500}
  renderItem={(node) => (
    <NodeItem key={node.name} node={node} />
  )}
/>
```

### 🎣 使用通用 Hooks
```typescript
import { useRuleset } from '@/hooks/useRuleset'

const { data, loading, refresh, updateItem } = useRuleset<RuleFile>(
  '/ruleset/geo',
  { autoRefresh: true, refreshInterval: 3000 }
)
```

---

## 后端开发

### 🔑 认证服务
```go
// 密码自动 bcrypt 加密
service := auth.NewService(dataDir)

// 登录（验证 bcrypt 哈希）
token, err := service.Login("admin", "password")

// 更新密码（自动哈希）
err = service.UpdatePassword("old", "new")
```

---

## 代码质量

### 运行 Lint
```bash
cd frontend
npm run lint          # 检查
npx eslint . --fix    # 自动修复
```

### Import 排序规则
```typescript
// 1. React 和相对路径
import React from 'react'
import { Button } from './Button'

// 2. @/ 别名
import { api } from '@/api'
import { Dialog } from '@/components/ui'

// 3. 其他
import axios from 'axios'
```

---

## 测试

### 后端测试
```bash
cd backend
go build -o p-box .  # 编译
```

### 前端测试
```bash
cd frontend
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run lint         # 代码检查
```

---

## 文件结构

```
frontend/src/
├── services/           # 服务层（推荐）
├── hooks/              # 通用 Hooks
├── components/ui/      # 通用组件
├── utils/              # 工具函数
├── stores/             # 状态管理
└── api/                # 旧 API 层（保留）
```

---

## 迁移检查清单

- [ ] 安装 ESLint 依赖
- [ ] 新代码使用 `services/`
- [ ] 大列表使用 `VirtualList`
- [ ] 对话框使用 `Dialog` 组件
- [ ] 全局状态使用 `appStore`
- [ ] WebSocket 使用 `wsManager`

---

**状态**: ✅ 已完成优化  
**文档**: [OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md)
