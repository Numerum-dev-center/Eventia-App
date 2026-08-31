import { Module } from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import { AdministratorController } from './administrator.controller';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Event } from 'src/event/entities/event.entity';
import { Order } from 'src/order/entities/order.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { ReportsModule } from 'src/reports/reports.module';
import { CommissionModule } from 'src/commission/commission.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Event, Order, Payment]),
    ReportsModule,
    CommissionModule,
    MailModule,
  ],
  controllers: [AdministratorController, AdminController],
  providers: [AdministratorService],
})
export class AdministratorModule {}
