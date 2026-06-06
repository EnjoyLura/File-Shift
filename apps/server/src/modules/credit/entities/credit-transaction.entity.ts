import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

/** 积分流水类型 */
export type TransactionType =
  | 'register_gift' // 注册赠送
  | 'invite_reward' // 邀请奖励
  | 'invitee_bonus' // 被邀请人奖励
  | 'conversion_deduct' // 转换扣减
  | 'conversion_refund' // 转换退款
  | 'topup'; // 充值

@Entity('credit_transactions')
@Index(['userId', 'createdAt'])
export class CreditTransaction {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, comment: '用户ID' })
  userId: number;

  @Column({
    type: 'enum',
    enum: [
      'register_gift',
      'invite_reward',
      'invitee_bonus',
      'conversion_deduct',
      'conversion_refund',
      'topup',
    ],
    comment: '交易类型',
  })
  type: TransactionType;

  @Column({ type: 'int', comment: '交易金额 (正数=收入, 负数=支出)' })
  amount: number;

  @Column({ type: 'int', comment: '交易后余额' })
  balanceAfter: number;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '关联业务ID (如taskNo)' })
  referenceId: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '备注说明' })
  description: string | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
