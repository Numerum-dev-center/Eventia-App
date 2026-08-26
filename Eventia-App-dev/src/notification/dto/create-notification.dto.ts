import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsNotEmpty() @IsString() title!: string;
  @IsNotEmpty() @IsString() message!: string;
  @IsNotEmpty() @IsEnum(NotificationType) type!: NotificationType;
  @IsOptional() @IsString() userId?: string;
}
