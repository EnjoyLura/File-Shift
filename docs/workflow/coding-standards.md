# FileShift 编码规范

## 1. TypeScript 通用规范

### 1.1 文件命名

| 类型              | 命名风格           | 示例                                |
| ----------------- | ------------------ | ----------------------------------- |
| React组件         | PascalCase         | `FileUpload.tsx`                    |
| 页面文件(Next.js) | 小写               | `page.tsx`, `layout.tsx`            |
| 工具函数          | camelCase          | `formatFileSize.ts`                 |
| 常量文件          | kebab-case         | `credit-costs.ts`                   |
| 类型定义          | camelCase          | `user.types.ts`                     |
| NestJS模块        | kebab-case         | `auth.module.ts`, `auth.service.ts` |
| 测试文件          | 同源文件 + `.spec` | `auth.service.spec.ts`              |

### 1.2 命名约定

```typescript
// 变量/函数 → camelCase
const userName = 'John';
function getUserById(id: number) { ... }

// 类/接口/类型 → PascalCase
class AuthService { ... }
interface UserProfile { ... }
type ConversionResult = { ... };

// 常量 → UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const DEFAULT_CREDITS = 50;

// 枚举 → PascalCase + PascalCase值
enum TaskStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
}

// 布尔值 → is/has/can/should 前缀
const isLoggedIn = true;
const hasPermission = false;
const canUpload = true;
```

### 1.3 类型使用

```typescript
// ✅ 优先使用 interface 定义对象类型
interface User {
  id: number;
  email: string;
  nickname: string;
}

// ✅ 使用 type 定义联合类型/交叉类型
type TaskStatusType = 'pending' | 'processing' | 'completed' | 'failed';

// ❌ 避免使用 any
// ✅ 不确定类型时使用 unknown + 类型守卫
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}

// ✅ 函数返回类型显式声明
function calculateCredits(type: string): number { ... }
async function getUser(id: number): Promise<User | null> { ... }
```

### 1.4 导入排序

```typescript
// 1. Node.js 内置模块
import path from 'path';
import fs from 'fs';

// 2. 第三方库
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

// 3. 内部共享包
import { UserType } from '@fileshift/shared-types';
import { CREDIT_COSTS } from '@fileshift/constants';

// 4. 项目内部模块(相对路径)
import { AuthService } from '../auth/auth.service';
import { UserEntity } from './entities/user.entity';
```

---

## 2. 前端规范 (Next.js + React)

### 2.1 组件规范

```typescript
// ✅ 函数组件 + 箭头函数
interface FileUploadProps {
  maxSize: number;
  acceptTypes: string[];
  onUpload: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ maxSize, acceptTypes, onUpload }) => {
  // Hooks 放在最上面
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 事件处理函数
  const handleDrop = useCallback((e: DragEvent) => {
    // ...
  }, [onUpload]);

  // 渲染
  return (
    <div className="...">
      {/* ... */}
    </div>
  );
};
```

### 2.2 目录规范

```
src/
├── app/                # Next.js App Router
│   ├── (marketing)/   # 路由组(不影响URL)
│   │   ├── page.tsx   # 首页
│   │   └── layout.tsx
│   └── (tools)/
│       └── [category]/[tool]/page.tsx
├── components/
│   ├── ui/            # 基础UI组件(按钮/输入框等)
│   ├── layout/        # 布局组件(Header/Footer/Sidebar)
│   └── features/      # 业务组件(上传/转换/积分等)
├── hooks/             # 自定义Hooks
├── lib/               # 工具函数
├── stores/            # Zustand状态管理
└── styles/            # 全局样式
```

### 2.3 状态管理规范

```typescript
// Zustand Store 示例
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  login: async (email, password) => {
    set({ isLoading: true });
    // ...
    set({ user, isLoading: false });
  },
  logout: () => set({ user: null }),
}));
```

### 2.4 TailwindCSS 规范

```tsx
// ✅ 类名按逻辑分组：布局 → 尺寸 → 边距 → 背景 → 文字 → 其他
<div className="flex items-center gap-4 w-full p-4 bg-white text-gray-700 rounded-lg shadow-sm">

// ✅ 复杂样式抽离为变量
const buttonStyles = cn(
  "inline-flex items-center justify-center",
  "px-4 py-2 rounded-md",
  "bg-primary text-white font-medium",
  "hover:bg-primary/90 transition-colors",
  "disabled:opacity-50 disabled:cursor-not-allowed"
);
```

---

## 3. 后端规范 (NestJS)

### 3.1 模块结构

```
modules/auth/
├── auth.module.ts         # 模块定义
├── auth.controller.ts     # 控制器(路由+参数校验)
├── auth.service.ts        # 业务逻辑
├── auth.guard.ts          # 守卫
├── dto/                   # 数据传输对象
│   ├── register.dto.ts
│   └── login.dto.ts
├── entities/              # TypeORM实体
│   └── user.entity.ts
├── interfaces/            # 接口定义
│   └── jwt-payload.interface.ts
└── auth.service.spec.ts   # 单元测试
```

### 3.2 Controller 规范

```typescript
@Controller('auth')
@ApiTags('认证')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '邮箱注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
```

### 3.3 Service 规范

```typescript
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    // 1. 校验邮箱未注册
    // 2. 创建用户
    // 3. 赠送积分
    // 4. 签发Token
    // 每一步有明确注释
  }
}
```

### 3.4 DTO 校验规范

```typescript
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: '邮箱地址', example: 'user@example.com' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @ApiProperty({ description: '密码(8-32位,含大小写和数字)' })
  @IsString()
  @MinLength(8, { message: '密码至少8位' })
  password: string;

  @ApiProperty({ description: '邀请码', required: false })
  @IsOptional()
  @IsString()
  inviteCode?: string;
}
```

---

## 4. 错误处理规范

### 4.1 后端统一异常

```typescript
// 自定义业务异常
export class BusinessException extends HttpException {
  constructor(code: number, message: string) {
    super({ code, message, data: null }, HttpStatus.OK);
  }
}

// 使用示例
throw new BusinessException(14001, '积分不足');
throw new BusinessException(12001, '文件格式不支持');
```

### 4.2 全局异常过滤器

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // 统一处理所有异常，返回标准格式
    // 生产环境不暴露内部错误细节
  }
}
```

---

## 5. 注释规范

```typescript
/**
 * 创建转换任务
 * @description 校验积分→扣减积分→创建任务→入队列
 * @param userId 用户ID
 * @param dto 转换请求参数
 * @returns 任务信息
 * @throws BusinessException 积分不足时抛出
 */
async createTask(userId: number, dto: CreateTaskDto): Promise<TaskResponse> {
  // 1. 检查用户积分余额
  const balance = await this.creditService.getBalance(userId);

  // 2. 计算本次消耗积分
  const cost = CREDIT_COSTS[dto.type];

  // 3. 扣减积分（数据库事务）
  await this.creditService.deduct(userId, cost, taskNo);

  // 4. 创建任务记录
  // ...
}
```
