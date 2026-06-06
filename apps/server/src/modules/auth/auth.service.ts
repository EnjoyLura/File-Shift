import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import Redis from 'ioredis';
import { User } from '../user/entities/user.entity';
import { VerificationCode } from './entities/verification-code.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendCodeDto } from './dto/send-code.dto';
import { REDIS_CLIENT } from '../../database/redis.module';

interface TokenPayload {
  sub: number;
  email: string | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(VerificationCode)
    private readonly codeRepo: Repository<VerificationCode>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  /** 发送验证码 */
  async sendCode(dto: SendCodeDto): Promise<{ message: string }> {
    const { target, type } = dto;

    // 频率限制：60 秒内同一 target 只能发送一次
    const rateLimitKey = `vcode:rate:${target}`;
    const exists = await this.redis.get(rateLimitKey);
    if (exists) {
      throw new BadRequestException('验证码发送过于频繁，请 60 秒后重试');
    }

    // 注册时检查邮箱是否已注册
    if (type === 'register') {
      const user = await this.userRepo.findOne({ where: { email: target } });
      if (user) {
        throw new ConflictException('该邮箱已被注册');
      }
    }

    // 登录时检查邮箱是否存在
    if (type === 'login') {
      const user = await this.userRepo.findOne({ where: { email: target } });
      if (!user) {
        throw new BadRequestException('该邮箱尚未注册');
      }
    }

    // 生成 6 位随机验证码
    const code = Math.random().toString().slice(2, 8);

    // 保存到数据库
    const verificationCode = this.codeRepo.create({
      target,
      code,
      type,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 分钟过期
    });
    await this.codeRepo.save(verificationCode);

    // 缓存验证码用于快速校验
    await this.redis.setex(`vcode:${target}:${type}`, 300, code);

    // 设置发送频率限制
    await this.redis.setex(rateLimitKey, 60, '1');

    // 开发环境直接打印验证码（生产环境接入邮件服务）
    this.logger.log(`[DEV] 验证码已发送至 ${target}: ${code}`);

    return { message: '验证码已发送，有效期 5 分钟' };
  }

  /** 邮箱注册 */
  async register(dto: RegisterDto) {
    const { email, password, code, inviteCode } = dto;

    // 校验验证码
    await this.verifyCode(email, 'register', code);

    // 检查邮箱是否已被注册
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('该邮箱已被注册');
    }

    // 校验邀请码
    let invitedBy: number | null = null;
    if (inviteCode) {
      const inviter = await this.userRepo.findOne({ where: { inviteCode } });
      if (!inviter) {
        throw new BadRequestException('邀请码无效');
      }
      invitedBy = inviter.id;
    }

    // 密码加密
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const user = this.userRepo.create({
      email,
      passwordHash,
      nickname: `用户${email.split('@')[0].slice(0, 10)}`,
      inviteCode: '', // BeforeInsert 会自动生成
      invitedBy,
      lastLoginAt: new Date(),
    });
    const saved = await this.userRepo.save(user);

    // 生成 Token
    const tokens = await this.generateTokens(saved);

    // 缓存 Refresh Token
    await this.redis.setex(
      `session:${saved.id}`,
      this.configService.get<number>('JWT_REFRESH_EXPIRES_IN', 604800),
      tokens.refreshToken,
    );

    return {
      ...tokens,
      user: {
        id: Number(saved.id),
        email: saved.email,
        nickname: saved.nickname,
      },
    };
  }

  /** 邮箱登录 */
  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('账号已被禁用');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 更新最后登录时间
    await this.userRepo.update(user.id, { lastLoginAt: new Date() });

    const tokens = await this.generateTokens(user);

    // 缓存 Refresh Token
    await this.redis.setex(
      `session:${user.id}`,
      this.configService.get<number>('JWT_REFRESH_EXPIRES_IN', 604800),
      tokens.refreshToken,
    );

    return {
      ...tokens,
      user: {
        id: Number(user.id),
        email: user.email,
        nickname: user.nickname,
      },
    };
  }

  /** 刷新 Token */
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
      });
      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }

      // 验证缓存的 Refresh Token
      const cachedToken = await this.redis.get(`session:${user.id}`);
      if (!cachedToken || cachedToken !== refreshToken) {
        throw new UnauthorizedException('Refresh Token 已失效');
      }

      const tokens = await this.generateTokens(user);

      // 更新缓存
      await this.redis.setex(
        `session:${user.id}`,
        this.configService.get<number>('JWT_REFRESH_EXPIRES_IN', 604800),
        tokens.refreshToken,
      );

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Refresh Token 无效或已过期');
    }
  }

  /** 退出登录 */
  async logout(userId: number) {
    await this.redis.del(`session:${userId}`);
    return { message: '已退出登录' };
  }

  /** 校验验证码 */
  private async verifyCode(target: string, type: string, code: string): Promise<void> {
    // 先从 Redis 缓存验证（快速路径）
    const cached = await this.redis.get(`vcode:${target}:${type}`);
    if (cached === code) {
      await this.redis.del(`vcode:${target}:${type}`);
      // 标记数据库中的验证码为已使用
      await this.codeRepo.update(
        { target, type: type as VerificationCode['type'], used: 0 },
        { used: 1 },
      );
      return;
    }

    // 从数据库验证（兜底）
    const record = await this.codeRepo.findOne({
      where: {
        target,
        type: type as VerificationCode['type'],
        used: 0,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });

    if (!record) {
      throw new BadRequestException('验证码无效或已过期');
    }

    // 更新尝试次数
    await this.codeRepo.update(record.id, { attempts: record.attempts + 1 });

    if (record.attempts >= 5) {
      throw new BadRequestException('验证码尝试次数过多，请重新获取');
    }

    if (record.code !== code) {
      throw new BadRequestException('验证码错误');
    }

    // 标记已使用
    await this.codeRepo.update(record.id, { used: 1 });
    await this.redis.del(`vcode:${target}:${type}`);
  }

  /** 生成 Token 对 */
  private async generateTokens(user: User) {
    const payload: TokenPayload = {
      sub: Number(user.id),
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get<number>('JWT_EXPIRES_IN', 7200),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<number>('JWT_REFRESH_EXPIRES_IN', 604800),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<number>('JWT_EXPIRES_IN', 7200),
    };
  }
}
