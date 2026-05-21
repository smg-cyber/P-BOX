package server

import "time"

type ErrorCode int

const (
	// 成功
	SUCCESS ErrorCode = 0

	// 客户端错误 (4xx)
	BAD_REQUEST      ErrorCode = 400
	UNAUTHORIZED     ErrorCode = 401
	FORBIDDEN        ErrorCode = 403
	NOT_FOUND        ErrorCode = 404
	METHOD_NOT_ALLOWED ErrorCode = 405
	CONFLICT         ErrorCode = 409

	// 服务端错误 (5xx)
	INTERNAL_ERROR        ErrorCode = 500
	NOT_IMPLEMENTED       ErrorCode = 501
	SERVICE_UNAVAILABLE   ErrorCode = 503
	GATEWAY_TIMEOUT       ErrorCode = 504

	// 业务错误 (1000-1999)
	CORE_NOT_RUNNING          ErrorCode = 1001
	CORE_START_FAILED         ErrorCode = 1002
	CORE_STOP_FAILED          ErrorCode = 1003
	CONFIG_INVALID            ErrorCode = 1004
	SUBSCRIPTION_PARSE_FAILED ErrorCode = 1005
	NODE_NOT_FOUND            ErrorCode = 1006
	RULESET_DOWNLOAD_FAILED   ErrorCode = 1007

	// 认证相关 (2000-2999)
	AUTH_DISABLED      ErrorCode = 2000
	INVALID_CREDENTIALS ErrorCode = 2001
	TOKEN_EXPIRED      ErrorCode = 2002
	TOKEN_INVALID      ErrorCode = 2003
	PASSWORD_TOO_WEAK  ErrorCode = 2004

	// 系统相关 (3000-3999)
	SYSTEM_PROXY_FAILED ErrorCode = 3001
	PERMISSION_DENIED   ErrorCode = 3002
	PORT_IN_USE         ErrorCode = 3003

	// 网络相关 (4000-4999)
	NETWORK_ERROR      ErrorCode = 4001
	TIMEOUT            ErrorCode = 4002
	CONNECTION_REFUSED ErrorCode = 4003
)

// 错误消息映射
var errorMessages = map[ErrorCode]string{
	SUCCESS:                "操作成功",
	BAD_REQUEST:            "请求参数错误",
	UNAUTHORIZED:           "未授权，请先登录",
	FORBIDDEN:              "无权限访问",
	NOT_FOUND:              "资源不存在",
	METHOD_NOT_ALLOWED:     "请求方法不允许",
	CONFLICT:               "资源冲突",
	INTERNAL_ERROR:         "服务器内部错误",
	NOT_IMPLEMENTED:        "功能尚未实现",
	SERVICE_UNAVAILABLE:    "服务暂时不可用",
	GATEWAY_TIMEOUT:        "网关超时",

	CORE_NOT_RUNNING:          "代理核心未运行",
	CORE_START_FAILED:         "启动代理核心失败",
	CORE_STOP_FAILED:          "停止代理核心失败",
	CONFIG_INVALID:            "配置文件无效",
	SUBSCRIPTION_PARSE_FAILED: "解析订阅失败",
	NODE_NOT_FOUND:            "节点不存在",
	RULESET_DOWNLOAD_FAILED:   "下载规则集失败",

	AUTH_DISABLED:       "认证未启用",
	INVALID_CREDENTIALS: "用户名或密码错误",
	TOKEN_EXPIRED:       "登录已过期，请重新登录",
	TOKEN_INVALID:       "令牌无效",
	PASSWORD_TOO_WEAK:   "密码强度不足",

	SYSTEM_PROXY_FAILED: "设置系统代理失败",
	PERMISSION_DENIED:   "权限不足",
	PORT_IN_USE:         "端口已被占用",

	NETWORK_ERROR:      "网络错误",
	TIMEOUT:            "请求超时",
	CONNECTION_REFUSED: "连接被拒绝",
}

// GetErrorMessage 获取错误消息
func GetErrorMessage(code ErrorCode) string {
	if msg, ok := errorMessages[code]; ok {
		return msg
	}
	return "未知错误"
}

// APIResponse 统一 API 响应格式
type APIResponse struct {
	Code      ErrorCode   `json:"code"`
	Message   string      `json:"message"`
	Data      interface{} `json:"data,omitempty"`
	Timestamp int64       `json:"timestamp,omitempty"`
}

// ErrorResponse 创建错误响应
func ErrorResponse(code ErrorCode, data interface{}) APIResponse {
	return APIResponse{
		Code:      code,
		Message:   GetErrorMessage(code),
		Data:      data,
		Timestamp: time.Now().Unix(),
	}
}

// SuccessResponse 创建成功响应
func SuccessResponse(data interface{}) APIResponse {
	return APIResponse{
		Code:      SUCCESS,
		Message:   "success",
		Data:      data,
		Timestamp: time.Now().Unix(),
	}
}

// CustomErrorResponse 创建自定义错误消息
func CustomErrorResponse(code ErrorCode, customMsg string, data interface{}) APIResponse {
	return APIResponse{
		Code:      code,
		Message:   customMsg,
		Data:      data,
		Timestamp: time.Now().Unix(),
	}
}
