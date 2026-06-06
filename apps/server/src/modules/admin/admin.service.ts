import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { ConversionTask } from '../conversion/entities/conversion-task.entity';
import { CreditTransaction } from '../credit/entities/credit-transaction.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(ConversionTask)
    private readonly taskRepo: Repository<ConversionTask>,
    @InjectRepository(CreditTransaction)
    private readonly txRepo: Repository<CreditTransaction>,
  ) {}

  /** 系统总览统计 */
  async getStats() {
    const totalUsers = await this.userRepo.count({ where: { status: 'active' } });
    const totalTasks = await this.taskRepo.count();
    const completedTasks = await this.taskRepo.count({ where: { status: 'completed' } });
    const failedTasks = await this.taskRepo.count({ where: { status: 'failed' } });
    const queuedTasks = await this.taskRepo.count({
      where: [{ status: 'queued' }, { status: 'processing' }],
    });

    // 今日新增用户
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUsers = await this.userRepo.count({
      where: { createdAt: MoreThanOrEqual(today) },
    });

    // 今日新增任务
    const todayTasks = await this.taskRepo.count({
      where: { createdAt: MoreThanOrEqual(today) },
    });

    // 总积分消费
    const totalSpentResult = await this.txRepo
      .createQueryBuilder('tx')
      .select('SUM(tx.amount)', 'total')
      .where('tx.type = :type', { type: 'conversion_deduct' })
      .getRawOne();

    return {
      totalUsers,
      totalTasks,
      completedTasks,
      failedTasks,
      queuedTasks,
      todayUsers,
      todayTasks,
      totalCreditsSpent: Math.abs(Number(totalSpentResult?.total || 0)),
    };
  }

  /** 用户列表 (分页 + 搜索) */
  async getUsers(page = 1, pageSize = 20, search?: string, status?: string) {
    const where: Record<string, unknown> = {};
    if (search) {
      // 搜索邮箱或昵称
      const qb = this.userRepo.createQueryBuilder('u');
      qb.where('(u.email LIKE :search OR u.nickname LIKE :search)', { search: `%${search}%` });
      if (status) qb.andWhere('u.status = :status', { status });
      qb.orderBy('u.createdAt', 'DESC')
        .skip((page - 1) * pageSize)
        .take(pageSize);

      const [list, total] = await qb.getManyAndCount();
      return {
        list: list.map((u) => this.maskUser(u)),
        total,
        page,
        pageSize,
      };
    }

    if (status) where.status = status;

    const [list, total] = await this.userRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: list.map((u) => this.maskUser(u)),
      total,
      page,
      pageSize,
    };
  }

  /** 修改用户状态 */
  async updateUserStatus(userId: number, status: 'active' | 'disabled') {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    if (user.role === 'admin') {
      throw new BadRequestException('不能修改管理员状态');
    }
    user.status = status;
    await this.userRepo.save(user);
    return { message: `用户已${status === 'active' ? '启用' : '禁用'}` };
  }

  /** 调整用户积分 */
  async adjustUserCredits(userId: number, amount: number, reason?: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.creditsBalance + amount < 0) {
      throw new BadRequestException('扣减后积分不能为负');
    }

    user.creditsBalance += amount;
    if (amount > 0) user.creditsTotalEarned += amount;
    if (amount < 0) user.creditsTotalSpent += Math.abs(amount);
    await this.userRepo.save(user);

    // 记录流水
    await this.txRepo.save({
      userId,
      type: amount > 0 ? 'topup' : 'conversion_deduct',
      amount,
      balanceAfter: user.creditsBalance,
      description: reason || `管理员${amount > 0 ? '增加' : '扣减'} ${Math.abs(amount)} 积分`,
    });

    return {
      message: `积分已${amount > 0 ? '增加' : '扣减'} ${Math.abs(amount)}`,
      newBalance: user.creditsBalance,
    };
  }

  /** 最近任务列表 */
  async getRecentTasks(page = 1, pageSize = 20) {
    const [list, total] = await this.taskRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: [],
    });

    return {
      list: list.map((t) => ({
        id: Number(t.id),
        taskNo: t.taskNo,
        userId: Number(t.userId),
        type: t.type,
        status: t.status,
        inputFileName: t.inputFileName,
        creditsCost: t.creditsCost,
        createdAt: t.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
    };
  }

  private maskUser(u: User) {
    return {
      id: Number(u.id),
      email: u.email,
      nickname: u.nickname,
      role: u.role,
      status: u.status,
      inviteCode: u.inviteCode,
      invitedBy: u.invitedBy ? Number(u.invitedBy) : null,
      creditsBalance: u.creditsBalance,
      creditsTotalEarned: u.creditsTotalEarned,
      creditsTotalSpent: u.creditsTotalSpent,
      lastLoginAt: u.lastLoginAt?.toISOString() || null,
      createdAt: u.createdAt.toISOString(),
    };
  }
}
