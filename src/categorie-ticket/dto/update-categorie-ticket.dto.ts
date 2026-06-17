import { PartialType } from '@nestjs/mapped-types';
import { CreateCategorieTicketDto } from './create-categorie-ticket.dto';

export class UpdateCategorieTicketDto extends PartialType(CreateCategorieTicketDto) {}
