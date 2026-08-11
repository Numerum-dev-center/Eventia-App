import { Injectable } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoiceService {
  create(createInvoiceDto: CreateInvoiceDto) {
    return 'This action adds a new facturation';
  }

  findAll() {
    return `This action returns all facturation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} facturation`;
  }

  update(id: number, updateFacturationDto: UpdateInvoiceDto) {
    return `This action updates a #${id} facturation`;
  }

  remove(id: number) {
    return `This action removes a #${id} facturation`;
  }
}
