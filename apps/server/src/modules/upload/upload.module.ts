import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadedFile } from './entities/uploaded-file.entity';
import { ConversionTask } from '../conversion/entities/conversion-task.entity';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { FileValidationService } from '../../common/services/file-validation.service';

@Module({
  imports: [TypeOrmModule.forFeature([UploadedFile, ConversionTask])],
  controllers: [UploadController],
  providers: [UploadService, FileValidationService],
  exports: [UploadService],
})
export class UploadModule {}
