import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CreditTransaction, TransactionType } from './entities/credit-transaction.entity';
import { ERROR_CODES } from '@fileshift/constants';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class CreditService {
  private readonly logger = new Logger(CreditService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(CreditTransaction)
    private readonly txRepo: Repository<CreditTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 检查用户积分余额是否足够
   */
  async checkBalance(userId: number, cost: number): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'creditsBalance'],
    });
    if (!user) {
      throw new BusinessException(ERROR_CODES.USER_NOT_FOUND, '用户不存在', 404);
    }
    if (user.creditsBalance < cost) {
      throw new BusinessException(
        ERROR_CODES.CREDIT_INSUFFICIENT,
        `积分不足，需要 ${cost} 积分，当前余额 ${user.creditsBalance} 积分`,
      );
    }
  }

  /**
   * 原子扣除积分 + 记录流水 (事务保证)
   * 返回是否扣除成功
   */
  async deductCredits(
    userId: number,
    cost: number,
    referenceId?: string,
    description?: string,
  ): Promise<boolean> {
    if (cost <= 0) return true;

    return this.dataSource.transaction(async (manager) => {
      // 乐观锁扣除
      const result = await manager
        .createQueryBuilder()
        .update(User)
        .set({
          creditsBalance: () => `creditsBalance - ${cost}`,
          creditsTotalSpent: () => `creditsTotalSpent + ${cost}`,
        })
        .where('id = :userId AND creditsBalance >= :cost', { userId, cost })
        .execute();

      if (result.affected === 0) {
        this.logger.warn(`积分扣除失败: userId=${userId}, cost=${cost}, 余额不足`);
        return false;
      }

      // 获取扣除后的余额
      const user = await manager.findOne(User, {
        where: { id: userId },
        select: ['creditsBalance'],
      });

      // 记录流水
      await manager.save(CreditTransaction, {
        userId,
        type: 'conversion_deduct' as TransactionType,
        amount: -cost,
        balanceAfter: user?.creditsBalance ?? 0,
        referenceId: referenceId || null,
        description: description || `转换消费 ${cost} 积分`,
      });

      this.logger.log(`积分扣除成功: userId=${userId}, cost=${cost}`);
      return true;
    });
  }

  /**
   * 退还积分 + 记录流水 (转换失败时调用)
   */
  async refundCredits(
    userId: number,
    cost: number,
    referenceId?: string,
    description?: string,
  ): Promise<void> {
    if (cost <= 0) return;

    await this.dataSource.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .update(User)
        .set({
          creditsBalance: () => `creditsBalance + ${cost}`,
          creditsTotalSpent: () => `creditsTotalSpent - ${cost}`,
        })
        .where('id = :userId', { userId })
        .execute();

      const user = await manager.findOne(User, {
        where: { id: userId },
        select: ['creditsBalance'],
      });

      await manager.save(CreditTransaction, {
        userId,
        type: 'conversion_refund' as TransactionType,
        amount: cost,
        balanceAfter: user?.creditsBalance ?? 0,
        referenceId: referenceId || null,
        description: description || `转换退款 ${cost} 积分`,
      });
    });

    this.logger.log(`积分退还成功: userId=${userId}, cost=${cost}`);
  }

  /**
   * 记录注册赠送积分流水
   */
  async logRegisterGift(userId: number, amount: number): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['creditsBalance'],
    });

    await this.txRepo.save({
      userId,
      type: 'register_gift' as TransactionType,
      amount,
      balanceAfter: user?.creditsBalance || amount,
      description: `注册赠送 ${amount} 积分`,
    });
  }

  /**
   * 发放邀请奖励积分 (给邀请人)
   */
  async grantInviteReward(inviterId: number, amount: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .update(User)
        .set({
          creditsBalance: () => `creditsBalance + ${amount}`,
          creditsTotalEarned: () => `creditsTotalEarned + ${amount}`,
        })
        .where('id = :inviterId', { inviterId })
        .execute();

      const user = await manager.findOne(User, {
        where: { id: inviterId },
        select: ['creditsBalance'],
      });

      await manager.save(CreditTransaction, {
        userId: inviterId,
        type: 'invite_reward' as TransactionType,
        amount,
        balanceAfter: user?.creditsBalance ?? 0,
        description: `邀请奖励 ${amount} 积分`,
      });
    });

    this.logger.log(`邀请奖励发放: inviterId=${inviterId}, amount=${amount}`);
  }

  /**
   * 发放被邀请人额外奖励
   */
  async grantInviteeBonus(inviteeId: number, amount: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .update(User)
        .set({
          creditsBalance: () => `creditsBalance + ${amount}`,
          creditsTotalEarned: () => `creditsTotalEarned + ${amount}`,
        })
        .where('id = :inviteeId', { inviteeId })
        .execute();

      const user = await manager.findOne(User, {
        where: { id: inviteeId },
        select: ['creditsBalance'],
      });

      await manager.save(CreditTransaction, {
        userId: inviteeId,
        type: 'invitee_bonus' as TransactionType,
        amount,
        balanceAfter: user?.creditsBalance ?? 0,
        description: `被邀请额外奖励 ${amount} 积分`,
      });
    });

    this.logger.log(`被邀请人奖励发放: inviteeId=${inviteeId}, amount=${amount}`);
  }

  /**
   * 获取用户积分流水记录 (分页)
   */
  async getTransactions(userId: number, page = 1, pageSize = 20) {
    const [list, total] = await this.txRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: list.map((tx) => ({
        id: Number(tx.id),
        type: tx.type,
        amount: tx.amount,
        balanceAfter: tx.balanceAfter,
        referenceId: tx.referenceId,
        description: tx.description,
        createdAt: tx.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
    };
  }
}
