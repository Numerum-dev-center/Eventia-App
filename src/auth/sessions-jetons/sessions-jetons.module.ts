import { Module } from '@nestjs/common';
import { SessionsJetonsService } from './sessions-jetons.service';
import { SessionsJetonsController } from './sessions-jetons.controller';

@Module({
  controllers: [SessionsJetonsController],
  providers: [SessionsJetonsService],
})
export class SessionsJetonsModule {}
