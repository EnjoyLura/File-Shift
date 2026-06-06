import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '3306'), 10),
        username: config.get<string>('DB_USERNAME', 'fileshift'),
        password: config.get<string>('DB_PASSWORD', 'fileshift123'),
        database: config.get<string>('DB_DATABASE', 'fileshift'),
        autoLoadEntities: true,
        synchronize: true, // 开发环境使用 synchronize，生产环境使用 migration
        charset: 'utf8mb4',
        logging: ['error', 'warn'],
      }),
    }),
  ],
})
export class DatabaseModule {}
