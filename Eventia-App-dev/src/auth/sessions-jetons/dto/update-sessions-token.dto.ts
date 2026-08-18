import { PartialType } from '@nestjs/mapped-types';
import { CreateSessionsTokenDto } from './create-sessions-token.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSessionsTokenDto extends PartialType(
  CreateSessionsTokenDto,
) {
  @IsOptional()
  @IsString()
  refreshTokenHash?: string;

  @IsOptional()
  expirationDate?: Date;
}
