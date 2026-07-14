import { PartialType } from '@nestjs/mapped-types';
import { CreateProfilOrganisateurDto } from './create-profil-organisateur.dto';

export class UpdateProfilOrganisateurDto extends PartialType(CreateProfilOrganisateurDto) {}
