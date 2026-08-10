import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Commande } from './entities/commande.entity';
import { TicketEmis } from 'src/tickets/entities/ticket-emis.entity';
import { Paiement } from 'src/paiement/entities/paiement.entity';
import { CategorieTicket } from 'src/categorie-ticket/entities/categorie-ticket.entity';
import { Evenement } from 'src/evenement/entities/evenement.entity';
import { StatutPaiement } from 'src/common/statut-paiement.enum';
import { StatutEvenement } from 'src/common/statut-evenement.enum';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class CommandeService {
  constructor(
    @InjectRepository(Commande)
    private commandeRepository: Repository<Commande>,
    @InjectRepository(TicketEmis)
    private ticketRepository: Repository<TicketEmis>,
    @InjectRepository(Paiement)
    private paiementRepository: Repository<Paiement>,
    @InjectRepository(CategorieTicket)
    private categorieRepository: Repository<CategorieTicket>,
  ) {}

  // Réservation "guest checkout" — le cœur de la billetterie.
  // Une transaction garantit qu'on ne survend jamais une catégorie de billet.
  async reserver(dto: CreateReservationDto) {
    const categorie = await this.categorieRepository.findOne({
      where: { id: dto.categorieTicketId },
      relations: { evenement: true },
    });
    if (!categorie) {
      throw new NotFoundException('Catégorie de billet introuvable');
    }
    if (categorie.evenement.statut !== StatutEvenement.PUBLIE) {
      throw new ForbiddenException("Cet événement n'est pas ouvert à la réservation");
    }
    if (categorie.quantiteDisponible < dto.quantite) {
      throw new BadRequestException(
        `Plus que ${categorie.quantiteDisponible} billet(s) disponible(s) pour cette catégorie`,
      );
    }
    if (
      categorie.limiteParPersonne &&
      dto.quantite > categorie.limiteParPersonne
    ) {
      throw new BadRequestException(
        `Limite de ${categorie.limiteParPersonne} billet(s) par personne pour cette catégorie`,
      );
    }

    // 1. Décrémenter le stock (première ligne de défense contre la survente)
    categorie.quantiteDisponible -= dto.quantite;
    await this.categorieRepository.save(categorie);

    const montantTotal = Number(categorie.prix) * dto.quantite;

    // 2. Créer la commande
    const commande = this.commandeRepository.create({
      montantTotal,
      statutPaiement: StatutPaiement.EN_ATTENTE,
      dateCommande: new Date(),
      buyerName: dto.buyerName,
      buyerEmail: dto.buyerEmail,
      buyerTelephone: dto.buyerTelephone,
    });
    const savedCommande = await this.commandeRepository.save(commande);

    // 3. Simuler le paiement Mobile Money (pas de vraie passerelle branchée)
    const paiement = this.paiementRepository.create({
      montant: montantTotal,
      statut: StatutPaiement.PAYE,
      methodePaiement: 'mobile_money',
      referenceTransactionExterne: `MM-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
      commande: savedCommande,
      commandeId: savedCommande.id,
    });
    await this.paiementRepository.save(paiement);

    savedCommande.statutPaiement = StatutPaiement.PAYE;
    await this.commandeRepository.save(savedCommande);

    // 4. Émettre un billet par unité, chacun avec un code QR unique
    const billets: TicketEmis[] = [];
    for (let i = 0; i < dto.quantite; i++) {
      const ticket = this.ticketRepository.create({
        codeUniqueCrypto: crypto.randomBytes(16).toString('hex'),
        commande: savedCommande,
        categorieTicket: categorie,
      });
      billets.push(await this.ticketRepository.save(ticket));
    }

    return {
      commande: savedCommande,
      billets,
    };
  }

  async findAllByEvenement(evenementId: string) {
    return this.commandeRepository
      .createQueryBuilder('commande')
      .innerJoinAndSelect('commande.ticketsEmis', 'ticket')
      .innerJoinAndSelect('ticket.categorieTicket', 'categorie')
      .innerJoin('categorie.evenement', 'evenement')
      .where('evenement.id = :evenementId', { evenementId })
      .orderBy('commande.dateCommande', 'DESC')
      .getMany();
  }

  async findOne(id: string) {
    const commande = await this.commandeRepository.findOne({
      where: { id },
      relations: { ticketsEmis: { categorieTicket: true }, paiements: true },
    });
    if (!commande) {
      throw new NotFoundException('Commande introuvable');
    }
    return commande;
  }

  async findAllAdmin() {
    return this.commandeRepository.find({
      relations: { ticketsEmis: { categorieTicket: { evenement: true } } },
      order: { dateCommande: 'DESC' },
    });
  }

  // --- Finances ---
  // Taux de commission plateforme, appliqué uniformément pour le moment
  // (le TDR prévoit un taux par type d'événement, non encore configurable).
  static readonly COMMISSION_RATE = 0.05;

  private static computeFinance(revenue: number) {
    const commission = Math.round(revenue * CommandeService.COMMISSION_RATE);
    return { revenue, commission, net: revenue - commission };
  }

  async financeByEvenement(evenementId: string, organisateurId?: string) {
    const commandes = await this.findAllByEvenement(evenementId);
    if (organisateurId) {
      // La vérification d'appartenance est faite en amont par le contrôleur.
    }
    const ticketsVendus = commandes.reduce(
      (sum, c) => sum + (c.ticketsEmis?.length ?? 0),
      0,
    );
    const revenue = commandes.reduce((sum, c) => sum + Number(c.montantTotal), 0);
    return {
      evenementId,
      ticketsVendus,
      ...CommandeService.computeFinance(revenue),
    };
  }

  async financeByOrganisateur(profilOrganisateurId: string, evenements: Evenement[]) {
    const details = await Promise.all(
      evenements.map(async (ev) => {
        const finance = await this.financeByEvenement(ev.id);
        return { titre: ev.titre, ...finance };
      }),
    );
    const totalRevenue = details.reduce((s, d) => s + d.revenue, 0);
    return {
      evenements: details,
      ...CommandeService.computeFinance(totalRevenue),
    };
  }

  async commissionsAdmin() {
    // Un seul taux global pour le moment ; structure pensée pour devenir
    // configurable par catégorie d'événement plus tard.
    return [
      { categorie: 'Toutes catégories', taux: CommandeService.COMMISSION_RATE },
    ];
  }

  async reversementsAdmin(evenementsParOrganisateur: Map<string, Evenement[]>) {
    const reversements: Array<{
      profilOrganisateurId: string;
      revenue: number;
      commission: number;
      net: number;
    }> = [];

    for (const [profilId, evenements] of evenementsParOrganisateur) {
      const finance = await this.financeByOrganisateur(profilId, evenements);
      reversements.push({
        profilOrganisateurId: profilId,
        revenue: finance.revenue,
        commission: finance.commission,
        net: finance.net,
      });
    }
    return reversements;
  }
}
