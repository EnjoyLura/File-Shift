import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
} from 'typeorm';
import * as crypto from 'crypto';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true, comment: '邮箱' })
  email: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, unique: true, comment: '手机号' })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '密码哈希' })
  passwordHash: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '昵称' })
  nickname: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '头像URL' })
  avatarUrl: string | null;

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user', comment: '角色' })
  role: 'user' | 'admin';

  @Column({
    type: 'enum',
    enum: ['active', 'disabled', 'deleted'],
    default: 'active',
    comment: '状态',
  })
  status: 'active' | 'disabled' | 'deleted';

  @Column({ type: 'varchar', length: 20, unique: true, comment: '邀请码' })
  inviteCode: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true, comment: '邀请人ID' })
  invitedBy: number | null;

  @Column({ type: 'int', unsigned: true, default: 0, comment: '积分余额' })
  creditsBalance: number;

  @Column({ type: 'int', unsigned: true, default: 0, comment: '累计获得积分' })
  creditsTotalEarned: number;

  @Column({ type: 'int', unsigned: true, default: 0, comment: '累计消费积分' })
  creditsTotalSpent: number;

  @Column({ type: 'datetime', nullable: true, comment: '最后登录时间' })
  lastLoginAt: Date | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime' })
  deletedAt: Date | null;

  @BeforeInsert()
  generateInviteCode() {
    if (!this.inviteCode) {
      this.inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 8);
    }
  }
}
