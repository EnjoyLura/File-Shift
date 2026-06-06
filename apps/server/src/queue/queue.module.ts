import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

export const IMAGE_QUEUE = 'image-conversion';
export const DOCUMENT_QUEUE = 'document-conversion';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD') || undefined,
        },
      }),
    }),
    BullModule.registerQueue(
      {
        name: IMAGE_QUEUE,
        defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
      },
      {
        name: DOCUMENT_QUEUE,
        defaultJobOptions: { attempts: 2, backoff: { type: 'exponential', delay: 5000 } },
      },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
