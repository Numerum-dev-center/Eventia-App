import { Injectable } from '@nestjs/common';
import { CreateProfilOrganisateurDto } from './dto/create-profil-organisateur.dto';
import { UpdateProfilOrganisateurDto } from './dto/update-profil-organisateur.dto';

@Injectable()
export class ProfilOrganisateurService {
  create(createProfilOrganisateurDto: CreateProfilOrganisateurDto) {
    return 'This action adds a new profilOrganisateur';
  }

  findAll() {
    return `This action returns all profilOrganisateur`;
  }

  findOne(id: number) {
    return `This action returns a #${id} profilOrganisateur`;
  }

  update(id: number, updateProfilOrganisateurDto: UpdateProfilOrganisateurDto) {
    return `This action updates a #${id} profilOrganisateur`;
  }

  remove(id: number) {
    return `This action removes a #${id} profilOrganisateur`;
  }
}
