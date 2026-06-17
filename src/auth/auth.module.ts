import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionsJetonsModule } from './sessions-jetons/sessions-jetons.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [SessionsJetonsModule],
})
export class AuthModule {}
