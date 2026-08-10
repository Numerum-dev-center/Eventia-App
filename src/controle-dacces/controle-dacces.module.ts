import { forwardRef, Module } from '@nestjs/common';
import { ControleDaccesService } from './controle-dacces.service';
import { ControleDaccesController } from './controle-dacces.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketEmis } from 'src/tickets/entities/ticket-emis.entity';
import { LogValidationBillet } from './entities/log-validation-billet.entity';
import { UtilisateurModule } from 'src/utilisateur/utilisateur.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TicketEmis, LogValidationBillet]),
    forwardRef(() => UtilisateurModule),
  ],
  controllers: [ControleDaccesController],
  providers: [ControleDaccesService],
})
export class ControleDaccesModule {}
