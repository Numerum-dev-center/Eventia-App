import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsTokenService } from './sessions-token.service';
import { SessionsTokenController } from './sessions-token.controller';
import { SessionsToken } from './entities/sessions-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SessionsToken])],
  controllers: [SessionsTokenController],
  providers: [SessionsTokenService],
  exports: [SessionsTokenService],
})
export class SessionsTokenModule {}
