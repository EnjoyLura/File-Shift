import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('verification_codes')
@Index(['target', 'type'])
export class VerificationCode {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255, comment: '目标(邮箱/手机号)' })
  target: string;

  @Column({ type: 'varchar', length: 6, comment: '验证码' })
  code: string;

  @Column({
    type: 'enum',
    enum: ['register', 'login', 'reset_password', 'bind'],
    comment: '类型',
  })
  type: 'register' | 'login' | 'reset_password' | 'bind';

  @Column({ type: 'tinyint', default: 0, comment: '是否已使用' })
  used: number;

  @Column({ type: 'tinyint', unsigned: true, default: 0, comment: '尝试次数' })
  attempts: number;

  @Column({ type: 'datetime', comment: '过期时间' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
