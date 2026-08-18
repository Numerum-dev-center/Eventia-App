import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  @IsNotEmpty()
  targetEntity!: string;

  @IsString()
  @IsNotEmpty()
  targetId!: string;

  @IsString()
  @IsNotEmpty()
  action!: string;

  changes!: any;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class UpdateAuditLogDto {}
