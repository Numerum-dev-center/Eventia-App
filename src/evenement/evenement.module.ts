import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evenement } from './entities/evenement.entity';
import { EvenementController } from './evenement.controller';
import { EvenementService } from './evenement.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Evenement]), // <--- C'EST CETTE LIGNE QUI MANQUE
  ],
  controllers: [EvenementController],
  providers: [EvenementService],
})
export class EvenementModule {}
