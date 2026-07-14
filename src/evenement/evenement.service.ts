import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evenement } from './entities/evenement.entity';
import { CreateEvenementDto } from './dto/create-evenement.dto';

@Injectable()
export class EvenementService {
  constructor(
    @InjectRepository(Evenement)
    private evenementRepository: Repository<Evenement>,
  ) {}

  private readonly logger = new Logger(EvenementService.name);

  async create(
    createEvenementDto: CreateEvenementDto,
    organisateurId: string,
  ): Promise<Evenement> {
    try {
      // 1. On crée une instance de l'entité avec les données du DTO
      // 2. On injecte l'organisateurId explicitement
      const evenement = this.evenementRepository.create({
        ...createEvenementDto,
        profilOrganisateur: { id: organisateurId }, // L'ID vient du token, pas du DTO
      });

      // 3. On sauvegarde dans la base de données
      return await this.evenementRepository.save(evenement);
    } catch (error) {
      // <--- Ici, on récupère l'objet erreur
      // Il est très utile de loguer cette erreur pour savoir CE QUI a planté
      this.logger.error("Détail de l'erreur :", error);
      throw new InternalServerErrorException(
        "Erreur lors de la création de l'événement",
      );
    }
  }
}
