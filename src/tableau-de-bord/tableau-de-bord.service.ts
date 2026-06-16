import { Injectable } from '@nestjs/common';
import { CreateTableauDeBordDto } from './dto/create-tableau-de-bord.dto';
import { UpdateTableauDeBordDto } from './dto/update-tableau-de-bord.dto';

@Injectable()
export class TableauDeBordService {
  create(createTableauDeBordDto: CreateTableauDeBordDto) {
    return 'This action adds a new tableauDeBord';
  }

  findAll() {
    return `This action returns all tableauDeBord`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tableauDeBord`;
  }

  update(id: number, updateTableauDeBordDto: UpdateTableauDeBordDto) {
    return `This action updates a #${id} tableauDeBord`;
  }

  remove(id: number) {
    return `This action removes a #${id} tableauDeBord`;
  }
}
