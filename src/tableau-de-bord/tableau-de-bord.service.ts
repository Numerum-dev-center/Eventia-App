/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';

@Injectable()
export class TableauDeBordService {
  findAll() {
    return `This action returns all tableauDeBord`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tableauDeBord`;
  }

  remove(id: number) {
    return `This action removes a #${id} tableauDeBord`;
  }
}
