import { Injectable } from '@nestjs/common';
import { CreateFonctionalitesExposeeDto } from './dto/create-fonctionalites-exposee.dto';
import { UpdateFonctionalitesExposeeDto } from './dto/update-fonctionalites-exposee.dto';

@Injectable()
export class FonctionalitesExposeesService {
  create(createFonctionalitesExposeeDto: CreateFonctionalitesExposeeDto) {
    return 'This action adds a new fonctionalitesExposee';
  }

  findAll() {
    return `This action returns all fonctionalitesExposees`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fonctionalitesExposee`;
  }

  update(id: number, updateFonctionalitesExposeeDto: UpdateFonctionalitesExposeeDto) {
    return `This action updates a #${id} fonctionalitesExposee`;
  }

  remove(id: number) {
    return `This action removes a #${id} fonctionalitesExposee`;
  }
}
