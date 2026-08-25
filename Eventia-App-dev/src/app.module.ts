import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventModule } from './event/event.module';
import { TicketsModule } from './tickets/tickets.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AcessControlModule } from './acess-control/acess-control.module';
import { InvoiceModule } from './invoice/invoice.module';
import { ExposedFeaturesModule } from './exposed-features/exposed-features.module';
import { AdministratorModule } from './administrator/administrator.module';
import { PaymentModule } from './payment/payment.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TicketCategoryModule } from './ticket-category/ticket-category.module';
import { AuditLogModule } from './logs-audit/audit-log.module';
import { OrderModule } from './order/order.module';
import { OrganizerProfileModule } from './organizer-profile/organizer-profile.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { AuditSubscriber } from './subscribers/audit.subscriber';
import { UserContextMiddleware } from './common/middlewares/user-context.middleware';
import { YeriaModule } from './yeria/yeria.module';
import { NotificationModule } from './notification/notification.module';
import { MediaModule } from './media/media.module';
import { CommissionModule } from './commission/commission.module';
import { EventCategoryModule } from './event-category/event-category.module';
import { PromoCodeModule } from './promo-code/promo-code.module';
import { OrganizerModule } from './organizer/organizer.module';
import { SupabaseModule } from './supabase/supabase.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      
    }),
    EventModule,
    TicketsModule,
    DashboardModule,
    AcessControlModule,
    InvoiceModule,
    ExposedFeaturesModule,
    AdministratorModule,
    PaymentModule,
    AuthModule,
    UserModule,
    TicketCategoryModule,
    AuditLogModule,
    OrderModule,
    OrganizerProfileModule,
    NotificationModule,
    MediaModule,
    CommissionModule,
    EventCategoryModule,
    PromoCodeModule,
    OrganizerModule,
    SupabaseModule,
    TypeOrmModule.forRootAsync({
      
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const useSsl = config.get<string>('DATABASE_SSL') !== 'false';
        return {
          type: 'postgres',
          url: config.get<string>('DATABASE_URL'), // C'est ici que tu mets l'URL d'Aiven
          autoLoadEntities: true,
          synchronize: config.get<string>('NODE_ENV') !== 'production',
          ssl: useSsl ? { rejectUnauthorized: false } : false,
          logging: true,
          subscribers: [AuditSubscriber],
        };
      },
      
    }),
    
    MailModule,
    YeriaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserContextMiddleware).forRoutes('*');
  }
}
