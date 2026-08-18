import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizerProfile } from './entities/organizer-profile.entity';
import { CreateOrganizerProfileDto } from './dto/create-organizer-profile.dto';
import { UpdateOrganizerProfileDto } from './dto/update-organizer-profile.dto';
import { StatutVerification } from 'src/common/profile-organizer-validation-statut.enum';

@Injectable()
export class OrganizerProfileService {
  constructor(
    @InjectRepository(OrganizerProfile)
    private organizerProfileRepository: Repository<OrganizerProfile>,
  ) {}

  private readonly logger = new Logger(OrganizerProfileService.name);

  async create(dto: CreateOrganizerProfileDto, userId: string): Promise<OrganizerProfile> {
    const existing = await this.organizerProfileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (existing) {
      throw new ConflictException('Un profil organisateur existe déjà pour cet utilisateur');
    }
    try {
      const profile = this.organizerProfileRepository.create({
        ...dto,
        user: { id: userId },
      });
      return await this.organizerProfileRepository.save(profile);
    } catch (error) {
      this.logger.error('Erreur lors de la création du profil organisateur', error);
      throw new InternalServerErrorException('Erreur lors de la création du profil');
    }
  }

  async findAll(): Promise<OrganizerProfile[]> {
    return await this.organizerProfileRepository.find({
      relations: { user: true, event: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<OrganizerProfile> {
    const profile = await this.organizerProfileRepository.findOne({
      where: { id },
      relations: { user: true, event: true },
    });
    if (!profile) {
      throw new NotFoundException(`Profil organisateur #${id} non trouvé`);
    }
    return profile;
  }

  async findByUserId(userId: string): Promise<OrganizerProfile> {
    const profile = await this.organizerProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: { event: true },
    });
    if (!profile) {
      throw new NotFoundException(`Profil organisateur pour l'utilisateur #${userId} non trouvé`);
    }
    return profile;
  }

  async update(id: string, dto: UpdateOrganizerProfileDto): Promise<OrganizerProfile> {
    const profile = await this.findOne(id);
    Object.assign(profile, dto);
    return await this.organizerProfileRepository.save(profile);
  }

  async updateVerificationStatut(
    id: string,
    statut: StatutVerification,
  ): Promise<OrganizerProfile> {
    const profile = await this.findOne(id);
    profile.verificationStatut = statut;
    return await this.organizerProfileRepository.save(profile);
  }

  async remove(id: string): Promise<void> {
    const profile = await this.findOne(id);
    await this.organizerProfileRepository.remove(profile);
  }
}
