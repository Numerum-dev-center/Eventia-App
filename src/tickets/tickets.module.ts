import { Module } from '@nestjs/common';
import { TicketService } from './tickets.service';
import { TicketController } from './tickets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Order } from 'src/order/entities/order.entity';
import { TicketCategory } from 'src/ticket-category/entities/ticket-category.entity';
import { ValidationTicketLog } from 'src/acess-control/entities/ticket-validation-log.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Order,
      TicketCategory,
      ValidationTicketLog,
    ]),
  ],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketsModule {}
