import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MailModule } from 'src/mail/mail.module';
import { OrganizerProfile } from 'src/organizer-profile/entities/organizer-profile.entity';
import { Order } from 'src/order/entities/order.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { SessionsToken } from 'src/auth/sessions-jetons/entities/sessions-token.entity';
import { AuditLog } from 'src/logs-audit/entities/audit-log.entity';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([
      User,
      OrganizerProfile,
      Order,
      Ticket,
      SessionsToken,
      AuditLog,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
    MailModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
