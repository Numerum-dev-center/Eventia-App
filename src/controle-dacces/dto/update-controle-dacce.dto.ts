import { PartialType } from '@nestjs/mapped-types';
import { CreateControleDacceDto } from './create-controle-dacce.dto';

export class UpdateControleDacceDto extends PartialType(CreateControleDacceDto) {}
