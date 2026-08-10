import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategorieTicket } from './entities/categorie-ticket.entity';
import { Evenement } from 'src/evenement/entities/evenement.entity';
import { CreateCategorieTicketDto } from './dto/create-categorie-ticket.dto';
import { UpdateCategorieTicketDto } from './dto/update-categorie-ticket.dto';

@Injectable()
export class CategorieTicketService {
  constructor(
    @InjectRepository(CategorieTicket)
    private categorieRepository: Repository<CategorieTicket>,
    @InjectRepository(Evenement)
    private evenementRepository: Repository<Evenement>,
  ) {}

  private async findOwnedEvenement(evenementId: string, organisateurId: string) {
    const evenement = await this.evenementRepository.findOne({
      where: { id: evenementId },
      relations: { profilOrganisateur: true },
    });
    if (!evenement) {
      throw new NotFoundException('Événement introuvable');
    }
    if (evenement.profilOrganisateur.id !== organisateurId) {
      throw new ForbiddenException("Cet événement ne vous appartient pas");
    }
    return evenement;
  }

  async create(
    evenementId: string,
    organisateurId: string,
    dto: CreateCategorieTicketDto,
  ) {
    const evenement = await this.findOwnedEvenement(evenementId, organisateurId);
    const categorie = this.categorieRepository.create({
      ...dto,
      quantiteDisponible: dto.quantiteTotale,
      evenement,
    });
    return this.categorieRepository.save(categorie);
  }

  async findAllByEvenement(evenementId: string) {
    return this.categorieRepository.find({
      where: { evenement: { id: evenementId } },
    });
  }

  async findOne(id: string) {
    const categorie = await this.categorieRepository.findOne({
      where: { id },
      relations: { evenement: { profilOrganisateur: true } },
    });
    if (!categorie) {
      throw new NotFoundException('Catégorie de billet introuvable');
    }
    return categorie;
  }

  async update(
    id: string,
    organisateurId: string,
    dto: UpdateCategorieTicketDto,
  ) {
    const categorie = await this.findOne(id);
    if (categorie.evenement.profilOrganisateur.id !== organisateurId) {
      throw new ForbiddenException("Cet événement ne vous appartient pas");
    }
    Object.assign(categorie, dto);
    return this.categorieRepository.save(categorie);
  }

  async remove(id: string, organisateurId: string) {
    const categorie = await this.findOne(id);
    if (categorie.evenement.profilOrganisateur.id !== organisateurId) {
      throw new ForbiddenException("Cet événement ne vous appartient pas");
    }
    await this.categorieRepository.remove(categorie);
  }

  // Utilisé par le module réservation pour décrémenter le stock
  async decrementerStock(id: string, quantite: number): Promise<CategorieTicket> {
    const categorie = await this.categorieRepository.findOne({ where: { id } });
    if (!categorie) {
      throw new NotFoundException('Catégorie de billet introuvable');
    }
    if (categorie.quantiteDisponible < quantite) {
      throw new ForbiddenException('Plus assez de billets disponibles');
    }
    categorie.quantiteDisponible -= quantite;
    return this.categorieRepository.save(categorie);
  }
}
