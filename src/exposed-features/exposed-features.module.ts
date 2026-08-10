import { Module } from '@nestjs/common';
import { ExposedFeaturesService } from './exposed-features.service';
import { ExposedFeaturesController } from './exposed-features.controller';

@Module({
  controllers: [ExposedFeaturesController],
  providers: [ExposedFeaturesService],
})
export class ExposedFeaturesModule {}
