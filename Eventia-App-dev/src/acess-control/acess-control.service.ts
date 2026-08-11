import { Injectable } from '@nestjs/common';
import { CreateAcessControlDto } from './dto/create-acess-control.dto';
import { UpdateAcessControlDto } from './dto/update-acess-control.dto';

@Injectable()
export class AcessControlService {
  create(createAcessControlDto: CreateAcessControlDto) {
    return 'This action adds a new controleDacce';
  }

  findAll() {
    return `This action returns all controleDacces`;
  }

  findOne(id: number) {
    return `This action returns a #${id} controleDacce`;
  }

  update(id: number, updateAcessControlDto: UpdateAcessControlDto) {
    return `This action updates a #${id} controleDacce`;
  }

  remove(id: number) {
    return `This action removes a #${id} controleDacce`;
  }
}
