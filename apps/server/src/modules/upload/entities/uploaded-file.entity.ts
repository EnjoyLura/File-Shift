import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('uploaded_files')
export class UploadedFile {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true, comment: '文件UUID' })
  @Index()
  fileId: string;

  @Column({ type: 'bigint', unsigned: true, comment: '上传用户ID' })
  @Index()
  userId: number;

  @Column({ type: 'varchar', length: 255, comment: '原始文件名' })
  originalName: string;

  @Column({ type: 'varchar', length: 500, comment: '存储路径 (相对路径)' })
  storagePath: string;

  @Column({ type: 'int', unsigned: true, comment: '文件大小 (字节)' })
  fileSize: number;

  @Column({ type: 'varchar', length: 100, comment: 'MIME 类型' })
  mimeType: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
