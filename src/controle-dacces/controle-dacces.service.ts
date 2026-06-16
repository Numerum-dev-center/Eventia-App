import { Injectable } from '@nestjs/common';
import { CreateControleDacceDto } from './dto/create-controle-dacce.dto';
import { UpdateControleDacceDto } from './dto/update-controle-dacce.dto';

@Injectable()
export class ControleDaccesService {
  create(createControleDacceDto: CreateControleDacceDto) {
    return 'This action adds a new controleDacce';
  }

  findAll() {
    return `This action returns all controleDacces`;
  }

  findOne(id: number) {
    return `This action returns a #${id} controleDacce`;
  }

  update(id: number, updateControleDacceDto: UpdateControleDacceDto) {
    return `This action updates a #${id} controleDacce`;
  }

  remove(id: number) {
    return `This action removes a #${id} controleDacce`;
  }
}
