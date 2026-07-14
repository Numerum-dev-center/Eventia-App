import { Module } from '@nestjs/common';
import { FacturationService } from './facturation.service';
import { FacturationController } from './facturation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commande } from 'src/commande/entities/commande.entity';
import { Facture } from './entities/facture.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Facture, Commande])],
  controllers: [FacturationController],
  providers: [FacturationService],
})
export class FacturationModule {}
