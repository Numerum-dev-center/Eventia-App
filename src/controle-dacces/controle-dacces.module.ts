import { Module } from '@nestjs/common';
import { ControleDaccesService } from './controle-dacces.service';
import { ControleDaccesController } from './controle-dacces.controller';

@Module({
  controllers: [ControleDaccesController],
  providers: [ControleDaccesService],
})
export class ControleDaccesModule {}
