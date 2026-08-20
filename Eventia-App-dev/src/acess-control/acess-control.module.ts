import { Module } from '@nestjs/common';
import { AcessControlService } from './acess-control.service';
import { AcessControlController } from './acess-control.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationTicketLog } from './entities/ticket-validation-log.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ValidationTicketLog, Ticket])],
  controllers: [AcessControlController],
  providers: [AcessControlService],
  exports: [AcessControlService],
})
export class AcessControlModule {}
