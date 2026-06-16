import { Module } from '@nestjs/common';
import { AdministrateurService } from './administrateur.service';
import { AdministrateurController } from './administrateur.controller';

@Module({
  controllers: [AdministrateurController],
  providers: [AdministrateurService],
})
export class AdministrateurModule {}
