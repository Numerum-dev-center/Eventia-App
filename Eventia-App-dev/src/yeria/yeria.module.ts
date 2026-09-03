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
          privateKey: normalizePem(
            config.get<string>('YERIA_PRIVATE_KEY'),
          ),
          publicKey: normalizePem(config.get<string>('YERIA_PUBLIC_KEY')),
          baseUrl: config.get<string>('YERIA_BASE_URL') ?? 'https://yeria.app',
        }),
    },
    YeriaService,
  ],
  exports: [YeriaService, YERIA_APP],
})
export class YeriaModule {}

/**
 * Normalise une clé PEM potentiellement stockée « aplatie » (les retours à la
 * ligne `\n` littéraux au lieu de vraies nouvelles lignes) dans une variable
 * d'environnement. `crypto.createPrivateKey` refuse un PEM sans vraies
 * nouvelles lignes (`DECODER routines::unsupported`). On remplace donc les
 * séquences `\n` / `\\n` littérales par de vrais sauts de ligne et on
 * reformate le corps base64 en lignes de 64 caractères.
 */
function normalizePem(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  // Évite une double interprétation si la valeur contient déjà des retours réels.
  let pem = value.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n');

  // Reformatte le corps base64 en lignes de 64 caractères si nécessaire.
  const match = pem.match(
    /-----BEGIN ([A-Z ]+) KEY-----([\s\S]*?)-----END ([A-Z ]+) KEY-----/,
  );
  if (!match) {
    return pem;
  }

  const body = match[2].replace(/[\s]+/g, '');
  const wrapped = body.match(/.{1,64}/g)?.join('\n') ?? body;
  return `-----BEGIN ${match[1]} KEY-----\n${wrapped}\n-----END ${match[3]} KEY-----`;
}
