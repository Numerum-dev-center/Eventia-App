import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Evenement } from './entities/evenement.entity';
import { CreateEvenementDto } from './dto/create-evenement.dto';
import { UpdateEvenementDto } from './dto/update-evenement.dto';
import { StatutEvenement } from 'src/common/statut-evenement.enum';
import { CategorieTicket } from 'src/categorie-ticket/entities/categorie-ticket.entity';
import { TicketEmis } from 'src/tickets/entities/ticket-emis.entity';

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
      const evenement = this.evenementRepository.create({
        ...createEvenementDto,
        profilOrganisateur: { id: organisateurId },
      });

      return await this.evenementRepository.save(evenement);
    } catch (error) {
      this.logger.error("Détail de l'erreur :", error);
      throw new InternalServerErrorException(
        "Erreur lors de la création de l'événement",
      );
    }
  }

  // Liste publique : uniquement les événements publiés
  async findPublished(): Promise<Evenement[]> {
    return this.evenementRepository.find({
      where: { statut: StatutEvenement.PUBLIE },
      relations: { categoriesTickets: true },
      order: { dateDebut: 'ASC' },
    });
  }

  async findOnePublic(id: string): Promise<Evenement> {
    const evenement = await this.evenementRepository.findOne({
      where: { id },
      relations: { categoriesTickets: true, profilOrganisateur: true },
    });
    if (!evenement) {
      throw new NotFoundException('Événement introuvable');
    }
    return evenement;
  }

  // Tous les événements d'un organisateur (tous statuts confondus)
  async findAllByOrganisateur(organisateurId: string): Promise<Evenement[]> {
    return this.evenementRepository.find({
      where: { profilOrganisateur: { id: organisateurId } },
      relations: { categoriesTickets: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllAdmin(): Promise<Evenement[]> {
    return this.evenementRepository.find({
      relations: { categoriesTickets: true, profilOrganisateur: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOwned(
    id: string,
    organisateurId: string,
  ): Promise<Evenement> {
    const evenement = await this.evenementRepository.findOne({
      where: { id },
      relations: { profilOrganisateur: true, categoriesTickets: true },
    });
    if (!evenement) {
      throw new NotFoundException('Événement introuvable');
    }
    if (evenement.profilOrganisateur.id !== organisateurId) {
      throw new ForbiddenException("Cet événement ne vous appartient pas");
    }
    return evenement;
  }

  async update(
    id: string,
    organisateurId: string,
    dto: UpdateEvenementDto,
  ): Promise<Evenement> {
    const evenement = await this.findOwned(id, organisateurId);
    Object.assign(evenement, dto);
    return this.evenementRepository.save(evenement);
  }

  async publish(id: string, organisateurId: string): Promise<Evenement> {
    const evenement = await this.findOwned(id, organisateurId);
    evenement.statut = StatutEvenement.PUBLIE;
    return this.evenementRepository.save(evenement);
  }

  async remove(id: string, organisateurId: string): Promise<void> {
    const evenement = await this.findOwned(id, organisateurId);
    const categorieIds = (evenement.categoriesTickets ?? []).map((c) => c.id);

    if (categorieIds.length > 0) {
      const ticketRepository = this.evenementRepository.manager.getRepository(TicketEmis);
      const billetsVendus = await ticketRepository.count({
        where: { categorieTicket: { id: In(categorieIds) } },
      });

      if (billetsVendus > 0) {
        throw new ConflictException(
          "Impossible de supprimer cet événement : des billets ont déjà été vendus. Annulez-le plutôt.",
        );
      }
    }

    try {
      if (categorieIds.length > 0) {
        const categorieRepository = this.evenementRepository.manager.getRepository(CategorieTicket);
        await categorieRepository.delete(categorieIds);
      }
      await this.evenementRepository.remove(evenement);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error("Erreur lors de la suppression de l'événement :", error);
      throw new InternalServerErrorException(
        "Erreur lors de la suppression de l'événement",
      );
    }
  }

  // Modération admin
  async setStatutAdmin(
    id: string,
    statut: StatutEvenement,
  ): Promise<Evenement> {
    const evenement = await this.evenementRepository.findOne({ where: { id } });
    if (!evenement) {
      throw new NotFoundException('Événement introuvable');
    }
    evenement.statut = statut;
    return this.evenementRepository.save(evenement);
  }
}
