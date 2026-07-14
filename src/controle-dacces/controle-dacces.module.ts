import { Module } from '@nestjs/common';
import { ControleDaccesService } from './controle-dacces.service';
import { ControleDaccesController } from './controle-dacces.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketEmis } from 'src/tickets/entities/ticket-emis.entity';
@Module({
  imports: [TypeOrmModule.forFeature([TicketEmis])],
  controllers: [ControleDaccesController],
  providers: [ControleDaccesService],
})
export class ControleDaccesModule {}
