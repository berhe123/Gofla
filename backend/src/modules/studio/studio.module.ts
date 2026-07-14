import { Module } from '@nestjs/common';
import { StudioService } from './studio.service';
import { StudioController } from './studio.controller';
import { ImageSimilarityService } from './image-similarity.service';

@Module({
  providers: [StudioService, ImageSimilarityService],
  controllers: [StudioController],
  exports: [StudioService],
})
export class StudioModule {}
