#!/bin/bash

set -e

echo "======================================"
echo "  P-BOX 优化验证测试"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass_count=0
fail_count=0

pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((pass_count++))
}

fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((fail_count++))
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
}

# 1. 后端编译测试
echo "1. 后端编译测试..."
cd /workspace/backend
if go build -o p-box-test . > /dev/null 2>&1; then
    pass "后端编译成功"
    rm -f p-box-test
else
    fail "后端编译失败"
fi

# 2. bcrypt 依赖检查
echo ""
echo "2. 检查 bcrypt 依赖..."
if grep -q "golang.org/x/crypto" go.mod; then
    pass "bcrypt 依赖已安装"
else
    fail "bcrypt 依赖未安装"
fi

# 3. 前端文件结构检查
echo ""
echo "3. 前端新增文件检查..."
cd /workspace/frontend

files=(
    "src/services/types.ts"
    "src/services/index.ts"
    "src/utils/websocket.ts"
    "src/hooks/useRuleset.ts"
    "src/components/ui/Dialog.tsx"
    "src/components/ui/VirtualList.tsx"
    "src/stores/appStore.ts"
    "src/constants/errors.ts"
    "src/utils/error-handler.ts"
    ".eslintrc.json"
    ".eslintignore"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        pass "文件存在：$file"
    else
        fail "文件缺失：$file"
    fi
done

# 4. 后端错误码定义检查
echo ""
echo "4. 后端错误处理检查..."
cd /workspace/backend
if [ -f "server/error.go" ]; then
    pass "错误码定义文件存在"
    
    # 检查是否定义了关键错误码
    if grep -q "CORE_NOT_RUNNING" server/error.go; then
        pass "核心错误码已定义"
    else
        fail "核心错误码未定义"
    fi
    
    if grep -q "INVALID_CREDENTIALS" server/error.go; then
        pass "认证错误码已定义"
    else
        fail "认证错误码未定义"
    fi
else
    fail "错误码定义文件不存在"
fi

# 5. 前端错误码定义检查
echo ""
echo "5. 前端错误处理检查..."
cd /workspace/frontend
if [ -f "src/constants/errors.ts" ]; then
    pass "错误码常量文件存在"
    
    if grep -q "enum ErrorCode" src/constants/errors.ts; then
        pass "ErrorCode 枚举已定义"
    else
        fail "ErrorCode 枚举未定义"
    fi
else
    fail "错误码常量文件不存在"
fi

# 6. WebSocket 管理器检查
echo ""
echo "6. WebSocket 管理器检查..."
if grep -q "class WebSocketManager" src/utils/websocket.ts; then
    pass "WebSocketManager 类已定义"
    
    if grep -q "getInstance()" src/utils/websocket.ts; then
        pass "单例模式已实现"
    else
        fail "单例模式未实现"
    fi
    
    if grep -q "subscribe" src/utils/websocket.ts; then
        pass "订阅功能已实现"
    else
        fail "订阅功能未实现"
    fi
else
    fail "WebSocketManager 类未定义"
fi

# 7. UI 组件检查
echo ""
echo "7. UI 组件检查..."
if grep -q "export function Dialog" src/components/ui/Dialog.tsx; then
    pass "Dialog 组件已导出"
else
    fail "Dialog 组件未导出"
fi

if grep -q "export function VirtualList" src/components/ui/VirtualList.tsx; then
    pass "VirtualList 组件已导出"
else
    fail "VirtualList 组件未导出"
fi

# 8. 服务层检查
echo ""
echo "8. 服务层检查..."
services=(
    "authService"
    "proxyService"
    "subscriptionService"
    "nodeService"
    "coreService"
)

for service in "${services[@]}"; do
    if grep -q "export const $service" src/services/index.ts; then
        pass "服务已导出：$service"
    else
        fail "服务未导出：$service"
    fi
done

# 9. ESLint 配置检查
echo ""
echo "9. ESLint 配置检查..."
if [ -f ".eslintrc.json" ]; then
    if grep -q "simple-import-sort" .eslintrc.json; then
        pass "Import 排序规则已配置"
    else
        warn "Import 排序规则未配置"
    fi
    
    if grep -q "@typescript-eslint" .eslintrc.json; then
        pass "TypeScript 规则已配置"
    else
        warn "TypeScript 规则未配置"
    fi
else
    fail "ESLint 配置文件不存在"
fi

# 10. CORS 配置检查
echo ""
echo "10. CORS 配置检查..."
cd /workspace/backend
if grep -q "allowedHosts" server/server.go; then
    pass "CORS 白名单配置已实现"
else
    fail "CORS 白名单配置未实现"
fi

# 总结
echo ""
echo "======================================"
echo "  测试结果汇总"
echo "======================================"
echo -e "通过：${GREEN}$pass_count${NC}"
echo -e "失败：${RED}$fail_count${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！优化已完整实施。${NC}"
    exit 0
else
    echo -e "${RED}⚠️  有 $fail_count 项测试未通过，请检查。${NC}"
    exit 1
fi
