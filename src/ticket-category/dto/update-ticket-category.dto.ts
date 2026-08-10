import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketCategoryDto } from './create-ticket-category.dto';

export class UpdateTicketCategoryDto extends PartialType(CreateTicketCategoryDto) {}
