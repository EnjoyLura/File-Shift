# FileShift 测试策略

## 1. 测试分层

```
┌─────────────────────────────────────┐
│         E2E 测试 (少量)             │  ← 核心用户流程
├─────────────────────────────────────┤
│       集成测试 (适量)                │  ← API接口、数据库交互
├─────────────────────────────────────┤
│       单元测试 (大量)                │  ← 业务逻辑、工具函数
└─────────────────────────────────────┘
```

### 1.1 测试比例目标

| 类型     | 比例 | 覆盖范围                              |
| -------- | ---- | ------------------------------------- |
| 单元测试 | 70%  | Service层业务逻辑、工具函数、转换引擎 |
| 集成测试 | 20%  | Controller层API、数据库操作、队列交互 |
| E2E测试  | 10%  | 注册登录、文件转换、积分扣减核心链路  |

### 1.2 测试工具链

| 工具            | 用途                |
| --------------- | ------------------- |
| Jest            | 测试框架 + 断言     |
| @nestjs/testing | NestJS单元/集成测试 |
| supertest       | HTTP接口测试        |
| Playwright      | E2E浏览器测试(可选) |

---

## 2. 单元测试

### 2.1 测试范围

**必须有单元测试的**：

- Service层业务逻辑
- 积分计算/扣减逻辑
- 文件校验逻辑（MIME类型、大小）
- 转换引擎核心方法
- 工具函数（格式化、计算、验证）
- 自定义Guard/Pipe/Interceptor

**不需要单元测试的**：

- 简单的CRUD Controller
- TypeORM Entity定义
- 模块配置文件

### 2.2 编写规范

```typescript
// auth.service.spec.ts
describe('AuthService', () => {
  let service: AuthService;
  let userRepo: MockRepository<UserEntity>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(UserEntity), useClass: MockRepository },
        { provide: JwtService, useValue: { sign: jest.fn() } },
      ],
    }).compile();

    service = module.get(AuthService);
    userRepo = module.get(getRepositoryToken(UserEntity));
  });

  describe('register', () => {
    it('应该成功注册新用户并赠送50积分', async () => {
      // Arrange
      const dto = { email: 'test@example.com', password: 'Abc123456', code: '123456' };
      userRepo.findOne.mockResolvedValue(null); // 邮箱未注册

      // Act
      const result = await service.register(dto);

      // Assert
      expect(result.user.email).toBe(dto.email);
      expect(result.accessToken).toBeDefined();
    });

    it('邮箱已注册时应抛出异常', async () => {
      // Arrange
      const dto = { email: 'existing@example.com', password: 'Abc123456', code: '123456' };
      userRepo.findOne.mockResolvedValue({ id: 1 }); // 邮箱已存在

      // Act & Assert
      await expect(service.register(dto)).rejects.toThrow('邮箱已被注册');
    });
  });
});
```

### 2.3 测试命名规范

```typescript
describe('被测试的类/函数', () => {
  describe('方法名', () => {
    it('应该[做什么]当[什么条件]', () => { ... });
    it('应该[做什么]当[什么条件]', () => { ... });
  });
});

// 示例命名：
it('应该返回用户信息当token有效', ...);
it('应该抛出401当token过期', ...);
it('应该扣减3积分当转换类型为pdf-to-word', ...);
it('应该拒绝上传当文件大小超过20MB', ...);
```

---

## 3. 集成测试

### 3.1 测试范围

- API接口的请求响应
- 数据库读写操作
- Redis缓存交互
- 队列任务创建

### 3.2 测试数据库

使用独立的测试数据库，测试前后自动清理：

```typescript
// test/setup.ts
beforeAll(async () => {
  // 使用测试数据库
  await dataSource.initialize();
  await dataSource.runMigrations();
});

afterEach(async () => {
  // 每个测试后清理数据
  const entities = dataSource.entityMetadatas;
  for (const entity of entities) {
    await dataSource.query(`TRUNCATE TABLE ${entity.tableName}`);
  }
});

afterAll(async () => {
  await dataSource.destroy();
});
```

### 3.3 API测试示例

```typescript
describe('POST /api/v1/auth/register', () => {
  it('应该成功注册并返回token', async () => {
    // Arrange: 先发送验证码
    await request(app.getHttpServer())
      .post('/api/v1/auth/send-code')
      .send({ target: 'test@example.com', type: 'register' });

    // Act
    const response = await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'test@example.com',
      password: 'Abc123456',
      code: '123456',
    });

    // Assert
    expect(response.status).toBe(201);
    expect(response.body.code).toBe(0);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.user.email).toBe('test@example.com');
  });

  it('邮箱格式错误应返回400', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'invalid', password: 'Abc123456', code: '123456' });

    expect(response.status).toBe(400);
  });
});
```

---

## 4. E2E 测试 (可选)

### 4.1 核心用户流程

仅覆盖最重要的端到端场景：

1. **注册→登录→查看积分**
2. **上传文件→创建转换→下载结果**
3. **积分不足→充值→继续转换**

### 4.2 使用 Playwright

```typescript
// e2e/conversion.spec.ts
import { test, expect } from '@playwright/test';

test('完整文件转换流程', async ({ page }) => {
  // 1. 登录
  await page.goto('/auth/login');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'Abc123456');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/');

  // 2. 进入转换页
  await page.goto('/tools/image/png-to-jpg');

  // 3. 上传文件
  const fileInput = page.locator('input[type=file]');
  await fileInput.setInputFiles('test/fixtures/sample.png');

  // 4. 开始转换
  await page.click('button:has-text("开始转换")');

  // 5. 等待完成
  await expect(page.locator('text=转换完成')).toBeVisible({ timeout: 30000 });

  // 6. 下载
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('button:has-text("下载文件")'),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.jpg$/);
});
```

---

## 5. 测试运行

### 5.1 常用命令

```powershell
# 运行所有测试
pnpm test

# 运行单个文件
pnpm --filter server test -- auth.service.spec.ts

# 运行带覆盖率
pnpm test:cov

# 监听模式(开发时)
pnpm test:watch

# E2E测试
pnpm test:e2e
```

### 5.2 覆盖率要求

| 模块         | 行覆盖率目标 |
| ------------ | ------------ |
| Service层    | ≥ 80%        |
| 工具函数     | ≥ 90%        |
| 转换引擎     | ≥ 70%        |
| Controller层 | ≥ 60%        |

### 5.3 CI中的测试

```yaml
# GitHub Actions 中运行测试
- name: Run tests
  run: pnpm test -- --coverage --ci
- name: Check coverage
  run: |
    # 覆盖率低于阈值则失败
    pnpm test:cov -- --coverageThreshold='{"global":{"lines":70}}'
```

---

## 6. Mock 策略

### 6.1 外部服务Mock

| 服务        | Mock方式                   |
| ----------- | -------------------------- |
| 数据库      | 测试容器 / Mock Repository |
| Redis       | ioredis-mock               |
| 邮件        | Mock SmtpService           |
| 微信API     | Mock HTTP请求              |
| FFmpeg      | Mock exec / 小文件实际执行 |
| LibreOffice | Mock exec / 跳过           |

### 6.2 测试固件(Fixtures)

```
test/
├── fixtures/          # 测试用固定文件
│   ├── sample.pdf     # 测试PDF(小文件)
│   ├── sample.png     # 测试图片
│   ├── sample.mp4     # 测试视频(很小)
│   └── corrupt.pdf    # 损坏的PDF(测试异常)
└── helpers/           # 测试辅助函数
    ├── mock-user.ts   # 创建测试用户
    └── mock-file.ts   # 创建测试文件
```
