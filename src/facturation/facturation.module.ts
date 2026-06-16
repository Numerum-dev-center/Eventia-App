import { Module } from '@nestjs/common';
import { FacturationService } from './facturation.service';
import { FacturationController } from './facturation.controller';

@Module({
  controllers: [FacturationController],
  providers: [FacturationService],
})
export class FacturationModule {}
