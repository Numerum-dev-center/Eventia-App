import { Module } from '@nestjs/common';
import { PaiementService } from './paiement.service';
import { PaiementController } from './paiement.controller';
import { Commande } from 'src/commande/entities/commande.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([Commande])],
  controllers: [PaiementController],
  providers: [PaiementService],
})
export class PaiementModule {}
