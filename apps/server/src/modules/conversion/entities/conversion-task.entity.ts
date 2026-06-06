import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { TaskStatus, TaskCategory } from '@fileshift/shared-types';

@Entity('conversion_tasks')
export class ConversionTask {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 32, unique: true, comment: '任务编号' })
  @Index()
  taskNo: string;

  @Column({ type: 'bigint', unsigned: true, comment: '用户ID' })
  @Index()
  userId: number;

  @Column({ type: 'varchar', length: 50, comment: '转换类型 (如 png-to-jpg)' })
  type: string;

  @Column({
    type: 'enum',
    enum: ['document', 'image', 'media', 'compress', 'tool'],
    comment: '任务分类',
  })
  category: TaskCategory;

  @Column({
    type: 'enum',
    enum: ['pending', 'uploading', 'queued', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    comment: '任务状态',
  })
  @Index()
  status: TaskStatus;

  // --- 输入文件 ---
  @Column({ type: 'varchar', length: 36, comment: '输入文件 UUID (uploaded_files.fileId)' })
  inputFileId: string;

  @Column({ type: 'varchar', length: 255, comment: '输入文件名' })
  inputFileName: string;

  @Column({ type: 'int', unsigned: true, default: 0, comment: '输入文件大小 (字节)' })
  inputFileSize: number;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '输入文件 MIME 类型' })
  inputMimeType: string | null;

  // --- 输出文件 ---
  @Column({ type: 'varchar', length: 255, nullable: true, comment: '输出文件名' })
  outputFileName: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '输出文件存储路径' })
  outputStoragePath: string | null;

  @Column({ type: 'int', unsigned: true, nullable: true, comment: '输出文件大小 (字节)' })
  outputFileSize: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '输出文件 MIME 类型' })
  outputMimeType: string | null;

  // --- 积分与进度 ---
  @Column({ type: 'int', unsigned: true, default: 0, comment: '消耗积分' })
  creditsCost: number;

  @Column({ type: 'tinyint', unsigned: true, default: 0, comment: '进度 0-100' })
  progress: number;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '错误信息' })
  errorMessage: string | null;

  // --- 时间 ---
  @Column({ type: 'datetime', nullable: true, comment: '完成时间' })
  completedAt: Date | null;

  @Column({ type: 'datetime', nullable: true, comment: '过期时间' })
  expiresAt: Date | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
