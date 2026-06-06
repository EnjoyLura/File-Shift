import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ConversionTask } from './entities/conversion-task.entity';
import { ConversionService } from './conversion.service';
import { ConversionController } from './conversion.controller';
import { ImageStrategy } from './strategies/image.strategy';
import { DocumentStrategy } from './strategies/document.strategy';
import { PdfStrategy } from './strategies/pdf.strategy';
import { MediaStrategy } from './strategies/media.strategy';
import { ImageProcessor } from './processors/image.processor';
import { DocumentProcessor } from './processors/document.processor';
import { PdfProcessor } from './processors/pdf.processor';
import { MediaProcessor } from './processors/media.processor';
import { CleanupService } from './cleanup.service';
import { UploadModule } from '../upload/upload.module';
import { IMAGE_QUEUE, DOCUMENT_QUEUE, MEDIA_QUEUE, PDF_QUEUE } from '../../queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConversionTask]),
    BullModule.registerQueue(
      { name: IMAGE_QUEUE },
      { name: DOCUMENT_QUEUE },
      { name: MEDIA_QUEUE },
      { name: PDF_QUEUE },
    ),
    UploadModule,
  ],
  controllers: [ConversionController],
  providers: [
    ConversionService,
    ImageStrategy,
    DocumentStrategy,
    PdfStrategy,
    MediaStrategy,
    ImageProcessor,
    DocumentProcessor,
    PdfProcessor,
    MediaProcessor,
    CleanupService,
  ],
  exports: [ConversionService],
})
export class ConversionModule {}
