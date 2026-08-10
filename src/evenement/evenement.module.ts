import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evenement } from './entities/evenement.entity';
import { EvenementController } from './evenement.controller';
import { EvenementService } from './evenement.service';
import { UtilisateurModule } from 'src/utilisateur/utilisateur.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Evenement]),
    forwardRef(() => UtilisateurModule),
  ],
  controllers: [EvenementController],
  providers: [EvenementService],
  exports: [EvenementService],
})
export class EvenementModule {}
