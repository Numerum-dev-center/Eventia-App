import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Payment } from 'src/payment/entities/payment.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User, Ticket, Payment])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
