import { Module } from '@nestjs/common';
import { FonctionalitesExposeesService } from './fonctionalites-exposees.service';
import { FonctionalitesExposeesController } from './fonctionalites-exposees.controller';

@Module({
  controllers: [FonctionalitesExposeesController],
  providers: [FonctionalitesExposeesService],
})
export class FonctionalitesExposeesModule {}
