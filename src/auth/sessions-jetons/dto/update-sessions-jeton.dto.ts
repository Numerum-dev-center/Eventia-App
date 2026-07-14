import { PartialType } from '@nestjs/mapped-types';
import { CreateSessionsJetonDto } from './create-sessions-jeton.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSessionsJetonDto extends PartialType(
  CreateSessionsJetonDto,
) {
  @IsOptional()
  @IsString()
  refresh_token_hash?: string;

  @IsOptional()
  date_expiration?: Date;
}
