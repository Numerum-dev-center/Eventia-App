import { Module } from '@nestjs/common';
import { EvenementController } from './evenement.controller';
import { EvenementService } from './evenement.service';

@Module({
  controllers: [EvenementController],
  providers: [EvenementService]
})
export class EvenementModule {}
