import { Module } from '@nestjs/common';
import { AcessControlService } from './acess-control.service';
import { AcessControlController } from './acess-control.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from 'src/tickets/entities/ticket.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Ticket])],
  controllers: [AcessControlController],
  providers: [AcessControlService],
})
export class AcessControlModule {}
