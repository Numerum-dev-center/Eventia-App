import { Injectable } from '@nestjs/common';
import { CreateOrganizerProfileDto } from './dto/create-organizer-profile.dto';
import { UpdateOrganizerProfileDto } from './dto/update-organizer-profile.dto';

@Injectable()
export class OrganizerProfileService {
  create(createOrganizerProfileDto: CreateOrganizerProfileDto) {
    return 'This action adds a new profilOrganisateur';
  }

  findAll() {
    return `This action returns all profilOrganisateur`;
  }

  findOne(id: number) {
    return `This action returns a #${id} profilOrganisateur`;
  }

  update(id: number, UpdateOrganizerProfileDto: UpdateOrganizerProfileDto) {
    return `This action updates a #${id} profilOrganisateur`;
  }

  remove(id: number) {
    return `This action removes a #${id} profilOrganisateur`;
  }
}
