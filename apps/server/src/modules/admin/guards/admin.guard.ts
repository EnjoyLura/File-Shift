import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;
    if (!userId) {
      throw new ForbiddenException('请先登录');
    }

    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'role', 'status'],
    });

    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('需要管理员权限');
    }

    if (user.status !== 'active') {
      throw new ForbiddenException('账号已被禁用');
    }

    return true;
  }
}
