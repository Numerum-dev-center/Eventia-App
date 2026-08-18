import { PartialType } from '@nestjs/mapped-types';
import { CreateAcessControlDto } from './create-acess-control.dto';

export class UpdateAcessControlDto extends PartialType(CreateAcessControlDto) {}
