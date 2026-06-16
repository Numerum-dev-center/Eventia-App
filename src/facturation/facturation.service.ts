import { Injectable } from '@nestjs/common';
import { CreateFacturationDto } from './dto/create-facturation.dto';
import { UpdateFacturationDto } from './dto/update-facturation.dto';

@Injectable()
export class FacturationService {
  create(createFacturationDto: CreateFacturationDto) {
    return 'This action adds a new facturation';
  }

  findAll() {
    return `This action returns all facturation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} facturation`;
  }

  update(id: number, updateFacturationDto: UpdateFacturationDto) {
    return `This action updates a #${id} facturation`;
  }

  remove(id: number) {
    return `This action removes a #${id} facturation`;
  }
}
