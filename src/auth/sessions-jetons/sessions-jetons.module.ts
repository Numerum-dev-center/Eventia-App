import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsJetonsService } from './sessions-jetons.service';
import { SessionsJetonsController } from './sessions-jetons.controller';
import { SessionsJetons } from './entities/sessions-jeton.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SessionsJetons])],
  controllers: [SessionsJetonsController],
  providers: [SessionsJetonsService],
  exports: [SessionsJetonsService],
})
export class SessionsJetonsModule {}
