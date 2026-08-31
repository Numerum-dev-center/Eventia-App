import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Event } from 'src/event/entities/event.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Order } from 'src/order/entities/order.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { User } from 'src/user/entities/user.entity';
import { Commission } from 'src/commission/entities/commission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Ticket, Order, Payment, User, Commission])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
