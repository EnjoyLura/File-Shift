import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { INVITE_REWARD_CREDITS } from '@fileshift/constants';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /** 获取用户详情 */
  async getProfile(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      id: Number(user.id),
      email: user.email,
      phone: user.phone,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      role: user.role,
      inviteCode: user.inviteCode,
      createdAt: user.createdAt.toISOString(),
      credits: {
        balance: user.creditsBalance || 0,
        totalEarned: user.creditsTotalEarned || 0,
        totalSpent: user.creditsTotalSpent || 0,
      },
    };
  }

  /** 更新用户信息 */
  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (dto.nickname !== undefined) {
      user.nickname = dto.nickname;
    }
    if (dto.avatarUrl !== undefined) {
      user.avatarUrl = dto.avatarUrl;
    }

    await this.userRepo.save(user);

    return {
      id: Number(user.id),
      email: user.email,
      phone: user.phone,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      role: user.role,
      inviteCode: user.inviteCode,
      createdAt: user.createdAt.toISOString(),
      credits: {
        balance: user.creditsBalance || 0,
        totalEarned: user.creditsTotalEarned || 0,
        totalSpent: user.creditsTotalSpent || 0,
      },
    };
  }

  /** 修改密码 */
  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new BadRequestException('当前账号未设置密码');
    }

    const isValid = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('原密码错误');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.save(user);

    return { message: '密码修改成功' };
  }

  /** 获取邀请统计 */
  async getInviteStats(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['inviteCode'],
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 统计被我邀请的人数
    const inviteCount = await this.userRepo.count({
      where: { invitedBy: userId },
    });

    const totalEarned = inviteCount * INVITE_REWARD_CREDITS;

    return {
      inviteCode: user.inviteCode,
      inviteCount,
      totalEarned,
      rewardPerInvite: INVITE_REWARD_CREDITS,
    };
  }

  /** 获取邀请历史列表 */
  async getInviteHistory(userId: number, page = 1, pageSize = 20) {
    const [list, total] = await this.userRepo.findAndCount({
      where: { invitedBy: userId },
      select: ['id', 'nickname', 'email', 'createdAt'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: list.map((u) => ({
        id: Number(u.id),
        nickname: u.nickname,
        email: u.email ? `${u.email.slice(0, 3)}***${u.email.slice(u.email.indexOf('@'))}` : null,
        reward: INVITE_REWARD_CREDITS,
        registeredAt: u.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
    };
  }
}
