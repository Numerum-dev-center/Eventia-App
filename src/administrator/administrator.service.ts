import { Injectable } from '@nestjs/common';
import { CreateAdministratorDto } from './dto/create-administrator.dto';
import { UpdateAdministratorDto } from './dto/update-administrator.dto';

@Injectable()
export class AdministratorService {
  create(createAdministratorDto: CreateAdministratorDto) {
    return 'This action adds a new administrateur';
  }

  findAll() {
    return `This action returns all administrateur`;
  }

  findOne(id: number) {
    return `This action returns a #${id} administrateur`;
  }

  update(id: number, updateAdministratorDto: UpdateAdministratorDto) {
    return `This action updates a #${id} administrateur`;
  }

  remove(id: number) {
    return `This action removes a #${id} administrateur`;
  }
}
