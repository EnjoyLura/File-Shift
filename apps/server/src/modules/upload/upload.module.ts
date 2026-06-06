import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadedFile } from './entities/uploaded-file.entity';
import { ConversionTask } from '../conversion/entities/conversion-task.entity';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UploadedFile, ConversionTask])],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
