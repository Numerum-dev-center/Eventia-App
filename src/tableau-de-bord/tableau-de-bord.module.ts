import { Module } from '@nestjs/common';
import { TableauDeBordService } from './tableau-de-bord.service';
import { TableauDeBordController } from './tableau-de-bord.controller';

@Module({
  controllers: [TableauDeBordController],
  providers: [TableauDeBordService],
})
export class TableauDeBordModule {}
