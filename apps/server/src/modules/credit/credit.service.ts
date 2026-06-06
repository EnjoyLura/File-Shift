import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { ERROR_CODES } from '@fileshift/constants';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class CreditService {
  private readonly logger = new Logger(CreditService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
   * 原子扣除积分 (乐观锁: UPDATE ... WHERE balance >= cost)
   * 返回是否扣除成功
   */
  async deductCredits(userId: number, cost: number): Promise<boolean> {
    if (cost <= 0) return true;

    const result = await this.userRepo
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

    this.logger.log(`积分扣除成功: userId=${userId}, cost=${cost}`);
    return true;
  }

  /**
   * 退还积分 (转换失败时调用)
   */
  async refundCredits(userId: number, cost: number): Promise<void> {
    if (cost <= 0) return;

    await this.userRepo
      .createQueryBuilder()
      .update(User)
      .set({
        creditsBalance: () => `creditsBalance + ${cost}`,
        creditsTotalSpent: () => `creditsTotalSpent - ${cost}`,
      })
      .where('id = :userId', { userId })
      .execute();

    this.logger.log(`积分退还成功: userId=${userId}, cost=${cost}`);
  }
}
