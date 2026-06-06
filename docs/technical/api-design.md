# FileShift API 接口设计

## 1. 设计规范

### 1.1 基础约定

- 基础路径：`/api/v1`
- 请求格式：`application/json`（文件上传除外）
- 响应格式：统一JSON结构
- 认证方式：Bearer Token (JWT)
- 时间格式：ISO 8601 (`2024-01-01T00:00:00.000Z`)

### 1.2 HTTP方法约定

| 方法   | 用途     |
| ------ | -------- |
| GET    | 获取资源 |
| POST   | 创建资源 |
| PUT    | 全量更新 |
| PATCH  | 部分更新 |
| DELETE | 删除资源 |

### 1.3 统一响应结构

```typescript
// 成功
{ "code": 0, "message": "success", "data": T }

// 分页
{ "code": 0, "message": "success", "data": { "list": T[], "total": number, "page": number, "pageSize": number } }

// 错误
{ "code": number, "message": string, "data": null }
```

### 1.4 错误码规范

| 范围        | 类别         |
| ----------- | ------------ |
| 10000-10999 | 认证相关错误 |
| 11000-11999 | 用户相关错误 |
| 12000-12999 | 文件相关错误 |
| 13000-13999 | 转换相关错误 |
| 14000-14999 | 积分相关错误 |
| 15000-15999 | 支付相关错误 |
| 99000-99999 | 系统错误     |

---

## 2. 认证模块 (Auth)

### 2.1 邮箱注册

```
POST /api/v1/auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Abc123456",
  "code": "123456",
  "inviteCode": "ABC123" // 可选
}
```

**Response:**

```json
{
  "code": 0,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 7200,
    "user": { "id": 1, "email": "user@example.com", "nickname": "用户xxx" }
  }
}
```

### 2.2 邮箱登录

```
POST /api/v1/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Abc123456"
}
```

### 2.3 发送验证码

```
POST /api/v1/auth/send-code
```

**Request Body:**

```json
{
  "target": "user@example.com",
  "type": "register" // register | login | reset_password
}
```

### 2.4 刷新Token

```
POST /api/v1/auth/refresh
```

**Request Body:**

```json
{
  "refreshToken": "eyJ..."
}
```

### 2.5 退出登录

```
POST /api/v1/auth/logout
Authorization: Bearer {token}
```

### 2.6 手机号登录 (阶段5)

```
POST /api/v1/auth/phone-login
```

### 2.7 微信登录 (阶段5)

```
GET  /api/v1/auth/wechat/qrcode  → 获取二维码
POST /api/v1/auth/wechat/callback → 微信回调
```

---

## 3. 用户模块 (User)

### 3.1 获取当前用户信息

```
GET /api/v1/user/profile
Authorization: Bearer {token}
```

**Response:**

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "phone": null,
    "nickname": "用户xxx",
    "avatarUrl": null,
    "role": "user",
    "inviteCode": "ABC123",
    "credits": { "balance": 47, "totalEarned": 50, "totalSpent": 3 },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3.2 更新用户信息

```
PATCH /api/v1/user/profile
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "nickname": "新昵称",
  "avatarUrl": "https://..."
}
```

### 3.3 修改密码

```
POST /api/v1/user/change-password
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "oldPassword": "Abc123456",
  "newPassword": "Xyz789012"
}
```

---

## 4. 文件模块 (File)

### 4.1 上传文件

```
POST /api/v1/files/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Fields:**

- `file`: 文件(binary)
- `purpose`: 用途 (`conversion` | `compress` | `tool`)

**Response:**

```json
{
  "code": 0,
  "data": {
    "fileId": "uuid-xxx",
    "fileName": "document.pdf",
    "fileSize": 2048000,
    "mimeType": "application/pdf",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4.2 下载文件

```
GET /api/v1/files/download/:taskNo
Authorization: Bearer {token}
```

返回文件流，Content-Disposition 附带文件名。

---

## 5. 转换模块 (Conversion)

### 5.1 创建转换任务

```
POST /api/v1/conversions
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "fileId": "uuid-xxx",
  "type": "pdf-to-word",
  "options": {
    "quality": "high",
    "pages": "all"
  }
}
```

**Response:**

```json
{
  "code": 0,
  "data": {
    "taskNo": "TASK20240101001",
    "status": "queued",
    "creditsCost": 3,
    "estimatedTime": 15,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5.2 查询任务状态

```
GET /api/v1/conversions/:taskNo
Authorization: Bearer {token}
```

**Response:**

```json
{
  "code": 0,
  "data": {
    "taskNo": "TASK20240101001",
    "type": "pdf-to-word",
    "status": "completed",
    "progress": 100,
    "inputFileName": "document.pdf",
    "outputFileName": "document.docx",
    "outputFileSize": 1536000,
    "creditsCost": 3,
    "downloadUrl": "/api/v1/files/download/TASK20240101001",
    "expiresAt": "2024-01-02T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "completedAt": "2024-01-01T00:00:15.000Z"
  }
}
```

### 5.3 获取任务进度 (SSE)

```
GET /api/v1/conversions/:taskNo/progress
Authorization: Bearer {token}
Accept: text/event-stream
```

**SSE Events:**

```
event: progress
data: {"progress": 45, "status": "processing"}

event: complete
data: {"status": "completed", "downloadUrl": "..."}

event: error
data: {"status": "failed", "message": "转换失败"}
```

### 5.4 转换历史列表

```
GET /api/v1/conversions?page=1&pageSize=20&status=completed
Authorization: Bearer {token}
```

### 5.5 取消任务

```
POST /api/v1/conversions/:taskNo/cancel
Authorization: Bearer {token}
```

---

## 6. 积分模块 (Credit)

### 6.1 获取积分余额

```
GET /api/v1/credits/balance
Authorization: Bearer {token}
```

### 6.2 积分流水

```
GET /api/v1/credits/transactions?page=1&pageSize=20&type=consume
Authorization: Bearer {token}
```

### 6.3 获取积分套餐列表

```
GET /api/v1/credits/packages
```

**Response:**

```json
{
  "code": 0,
  "data": [
    { "id": 1, "name": "体验包", "credits": 100, "price": 990, "originalPrice": 990 },
    { "id": 2, "name": "基础包", "credits": 300, "price": 2500, "originalPrice": 2970 }
  ]
}
```

---

## 7. 邀请模块 (Invite)

### 7.1 获取邀请信息

```
GET /api/v1/invite/info
Authorization: Bearer {token}
```

**Response:**

```json
{
  "code": 0,
  "data": {
    "inviteCode": "ABC123",
    "inviteLink": "https://fileshift.cn/register?invite=ABC123",
    "totalInvited": 5,
    "totalEarned": 100
  }
}
```

### 7.2 邀请记录

```
GET /api/v1/invite/records?page=1&pageSize=20
Authorization: Bearer {token}
```

---

## 8. 支付模块 (Payment) - 阶段5

### 8.1 创建支付订单

```
POST /api/v1/payments/create
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "packageId": 1,
  "paymentMethod": "wechat"
}
```

### 8.2 支付回调

```
POST /api/v1/payments/notify/wechat   (微信回调)
POST /api/v1/payments/notify/alipay   (支付宝回调)
```

### 8.3 查询订单状态

```
GET /api/v1/payments/:orderNo
Authorization: Bearer {token}
```

---

## 9. 收藏模块 (Favorite)

### 9.1 添加收藏

```
POST /api/v1/favorites
Authorization: Bearer {token}
Body: { "toolKey": "pdf-to-word" }
```

### 9.2 取消收藏

```
DELETE /api/v1/favorites/:toolKey
Authorization: Bearer {token}
```

### 9.3 收藏列表

```
GET /api/v1/favorites
Authorization: Bearer {token}
```

---

## 10. 管理后台 (Admin) - 阶段5

### 10.1 用户列表

```
GET /api/v1/admin/users?page=1&keyword=xxx
Authorization: Bearer {admin_token}
```

### 10.2 数据统计

```
GET /api/v1/admin/statistics/overview
GET /api/v1/admin/statistics/conversions?period=7d
GET /api/v1/admin/statistics/revenue?period=30d
Authorization: Bearer {admin_token}
```

### 10.3 禁用用户

```
POST /api/v1/admin/users/:id/disable
Authorization: Bearer {admin_token}
```
