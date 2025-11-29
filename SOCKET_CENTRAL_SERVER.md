# Socket.IO Central Server Implementation

## 架构概述

本项目实现了一个基于 Socket.IO 的中心服务器，所有客户端通过 Socket.IO 连接到这个中心来收发消息、通知和实时聊天。

## 核心功能

### 1. 实时通知系统
- 订单状态更新通知
- 新服务上架通知
- 库存更新通知
- 系统消息广播

### 2. 全局聊天室
- 实时聊天消息
- 在线用户列表
- 打字状态指示器
- 消息历史记录

### 3. 私信功能
- 用户间点对点消息
- 消息送达确认

### 4. 在线状态
- 实时在线用户数量
- 用户连接/断开事件

## 文件结构

```
server/
├── plugins/
│   └── socket.ts                 # Socket.IO 服务器初始化和事件处理
├── utils/
│   └── socket-helpers.ts         # Socket.IO 辅助函数（发送通知、消息等）
└── api/
    ├── admin/orders/[id]/status.patch.ts    # 订单状态更新（发送通知）
    └── services/index.post.ts               # 新服务创建（发送通知）

composables/
└── useSocket.ts                  # 客户端 Socket.IO composable

components/
├── SocketStatus.vue              # 连接状态、在线人数、通知面板
└── ChatWidget.vue                # 聊天组件

plugins/
└── socket.client.ts              # 自动连接 Socket.IO
```

## Socket.IO 事件

### 服务器发送事件

| 事件名 | 描述 | 数据格式 |
|--------|------|----------|
| `users:online` | 在线用户数更新 | `{ count: number }` |
| `order:status_updated` | 订单状态更新 | `{ orderId, status, userId, timestamp }` |
| `service:new` | 新服务上架 | `{ serviceId, name, gameId, timestamp }` |
| `service:stock_updated` | 库存更新 | `{ serviceId, stock, timestamp }` |
| `notification:new` | 新通知 | `{ type, title, message, timestamp }` |
| `chat:message` | 聊天消息 | `{ username, message, timestamp, socketId }` |
| `chat:typing` | 打字指示器 | `{ username, isTyping, socketId }` |
| `message:private` | 私信 | `{ fromUserId, fromUsername, message, timestamp }` |
| `system:message` | 系统消息 | `{ message, type, timestamp }` |

### 客户端发送事件

| 事件名 | 描述 | 数据格式 |
|--------|------|----------|
| `user:authenticate` | 用户认证 | `{ userId, username }` |
| `chat:message` | 发送聊天消息 | `{ message, username, timestamp }` |
| `chat:typing` | 发送打字状态 | `{ username, isTyping }` |
| `message:private` | 发送私信 | `{ toUserId, message }` |

## 使用方法

### 服务器端发送通知

```typescript
import { emitOrderStatusUpdate, emitNewService, emitSystemMessage } from '~/server/utils/socket-helpers'

// 发送订单状态更新
emitOrderStatusUpdate(orderId, 'completed', userId)

// 发送新服务通知
emitNewService(service)

// 发送系统消息
emitSystemMessage('系统维护通知', 'warning')
```

### 客户端使用

```vue
<script setup>
const {
  isConnected,
  onlineCount,
  notifications,
  chatMessages,
  sendChatMessage,
  sendPrivateMessage,
  markNotificationAsRead,
} = useSocket()

// 发送聊天消息
const sendMessage = () => {
  sendChatMessage('Hello world!')
}

// 监听通知
watch(notifications, (newNotifications) => {
  if (newNotifications.length > 0) {
    // 处理新通知
  }
})
</script>
```

## 开发注意事项

1. **Vite 插件初始化**: Socket.IO 通过 `nuxt.config.ts` 中的 Vite 插件初始化，确保在开发模式下正确附加到 HTTP 服务器

2. **事件命名约定**: 
   - 使用 `:` 分隔命名空间和事件名（如 `order:status_updated`）
   - 系统级事件使用 `system:` 前缀
   - 用户相关使用 `user:` 前缀

3. **状态管理**: Socket.IO 状态使用 `useState` 保存在全局状态中，支持跨组件访问

4. **错误处理**: 所有 Socket.IO 操作都包含错误处理和日志记录

5. **生产环境**: 在生产环境中，Socket.IO 服务器自动附加到 Nitro 服务器的 HTTP 实例

## 测试方法

### 测试实时通知

1. 打开两个浏览器窗口
2. 在一个窗口中以 admin 身份登录
3. 在另一个窗口中以普通用户身份登录
4. admin 更新订单状态
5. 用户窗口应该立即收到通知

### 测试聊天功能

1. 打开多个浏览器窗口
2. 在每个窗口中登录不同用户
3. 点击右下角的聊天按钮打开聊天组件
4. 发送消息，所有窗口应该实时接收

### 测试在线状态

1. 打开浏览器窗口
2. 查看右下角的在线用户数量
3. 打开更多窗口，数量应该增加
4. 关闭窗口，数量应该减少

## 故障排除

### Socket.IO 连接失败

- 检查浏览器控制台是否有 CORS 错误
- 确认 `NUXT_PUBLIC_SITE_URL` 环境变量设置正确
- 检查防火墙是否阻止 WebSocket 连接

### 通知未收到

- 确认 Socket.IO 已连接（右下角显示 "Connected"）
- 检查服务器日志是否有事件发送记录
- 确认用户ID匹配（只有目标用户会收到某些通知）

### 聊天消息不显示

- 确认用户已登录
- 检查网络请求中是否有 `/socket.io/` 路径
- 查看浏览器控制台是否有 JavaScript 错误

## 性能优化

1. **消息限制**: 聊天和通知列表限制最多保存 50 条记录
2. **自动清理**: 断开连接时自动清理用户数据
3. **事件节流**: 打字指示器使用 1 秒节流
4. **传输优先级**: WebSocket 优先，降级到 polling

## 安全考虑

1. **用户认证**: 所有 Socket.IO 操作需要用户先通过 `user:authenticate` 事件认证
2. **消息验证**: 服务器端验证所有接收的消息格式和内容
3. **私信权限**: 私信需要知道目标用户ID，防止随意发送
4. **CORS配置**: 限制只有配置的域名可以连接

## 未来扩展

- [ ] 添加聊天室功能（多个独立聊天室）
- [ ] 文件上传支持（图片、视频）
- [ ] 消息搜索功能
- [ ] 消息已读状态
- [ ] 用户在线状态细节（活跃、离开、忙碌）
- [ ] 消息加密
- [ ] 群组聊天
- [ ] 语音/视频通话支持
