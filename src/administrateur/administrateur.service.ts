import { Injectable } from '@nestjs/common';
import { CreateAdministrateurDto } from './dto/create-administrateur.dto';
import { UpdateAdministrateurDto } from './dto/update-administrateur.dto';

@Injectable()
export class AdministrateurService {
  create(createAdministrateurDto: CreateAdministrateurDto) {
    return 'This action adds a new administrateur';
  }

  findAll() {
    return `This action returns all administrateur`;
  }

  findOne(id: number) {
    return `This action returns a #${id} administrateur`;
  }

  update(id: number, updateAdministrateurDto: UpdateAdministrateurDto) {
    return `This action updates a #${id} administrateur`;
  }

  remove(id: number) {
    return `This action removes a #${id} administrateur`;
  }
}
