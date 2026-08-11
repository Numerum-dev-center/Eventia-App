import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { YeriaApp } from '@numerum-tech/yeriasdk';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Order } from 'src/order/entities/order.entity';
import { Event } from 'src/event/entities/event.entity';
import { TicketCategory } from 'src/ticket-category/entities/ticket-category.entity';
import { ValidationTicketLog } from 'src/acess-control/entities/ticket-validation-log.entity';
import { User } from 'src/user/entities/user.entity';
import { YERIA_APP } from './yeria.constants';
import { YeriaService } from './yeria.service';
import { YeriaController } from './yeria.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ticket,
      Order,
      Event,
      TicketCategory,
      ValidationTicketLog,
      User,
    ]),
  ],
  controllers: [YeriaController],
  providers: [
    {
      provide: YERIA_APP,
      inject: [ConfigService],
      useFactory: (config: ConfigService): YeriaApp =>
        new YeriaApp({
          appId: config.get<string>('YERIA_APP_ID') ?? 'eventia',
          privateKey: config.get<string>('YERIA_PRIVATE_KEY'),
          publicKey: config.get<string>('YERIA_PUBLIC_KEY'),
          baseUrl: 'https://yeria.app',
        }),
    },
    YeriaService,
  ],
  exports: [YeriaService, YERIA_APP],
})
export class YeriaModule {}
