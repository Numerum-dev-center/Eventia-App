import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Utilisateur } from 'src/utilisateur/entities/utilisateur.entity';
import { Evenement } from 'src/evenement/entities/evenement.entity';
import { TicketEmis } from 'src/tickets/entities/ticket-emis.entity';
import { StatutValidation } from 'src/common/statut-validation-ticket.enum';
import { StatutEvenement } from 'src/common/statut-evenement.enum';
import { Role } from 'src/common/role.enum';
import { CommandeService } from 'src/commande/commande.service';

@Injectable()
export class TableauDeBordService {
  constructor(
    @InjectRepository(Utilisateur)
    private utilisateurRepository: Repository<Utilisateur>,
    @InjectRepository(Evenement)
    private evenementRepository: Repository<Evenement>,
    @InjectRepository(TicketEmis)
    private ticketRepository: Repository<TicketEmis>,
    private readonly commandeService: CommandeService,
  ) {}

  // 6 KPIs pour le tableau de bord admin (US-7)
  async dashboardAdmin() {
    const [utilisateurs, organisateurs, evenements, evenementsPublies, billets, billetsScannes] =
      await Promise.all([
        this.utilisateurRepository.count(),
        this.utilisateurRepository.count({ where: { role: Role.ORGANISATEUR } }),
        this.evenementRepository.count(),
        this.evenementRepository.count({ where: { statut: StatutEvenement.PUBLIE } }),
        this.ticketRepository.count(),
        this.ticketRepository.count({ where: { statutValidation: StatutValidation.SCANNE } }),
      ]);

    const revenueGlobal = await this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoin('ticket.categorieTicket', 'categorie')
      .select('COALESCE(SUM(categorie.prix), 0)', 'total')
      .getRawOne<{ total: string }>();

    const revenue = Number(revenueGlobal?.total ?? 0);

    return {
      utilisateurs,
      organisateurs,
      evenements,
      evenementsPublies,
      billetsVendus: billets,
      tauxCheckIn: billets > 0 ? Math.round((billetsScannes / billets) * 100) : 0,
      revenue,
    };
  }

  // Dashboard organisateur : revenus, inscrits, taux check-in, note (US-7)
  async dashboardOrganisateur(profilOrganisateurId: string) {
    const evenements = await this.evenementRepository.find({
      where: { profilOrganisateur: { id: profilOrganisateurId } },
    });

    const billets = await this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.categorieTicket', 'categorie')
      .innerJoin('categorie.evenement', 'evenement')
      .where('evenement.profil_organisateur_id = :id', { id: profilOrganisateurId })
      .getMany();

    const scannes = billets.filter((b) => b.statutValidation === StatutValidation.SCANNE);
    const finance = await this.commandeService.financeByOrganisateur(
      profilOrganisateurId,
      evenements,
    );

    return {
      evenements: evenements.length,
      inscrits: billets.length,
      checkins: scannes.length,
      tauxCheckIn: billets.length > 0 ? Math.round((scannes.length / billets.length) * 100) : 0,
      revenue: finance.revenue,
      // Aucun système de notation des événements n'est encore implémenté.
      note: null,
    };
  }

  // Rapports admin — synthèse par période (export CSV/PDF non implémenté)
  async reportsAdmin(from?: string, to?: string) {
    const kpis = await this.dashboardAdmin();
    return {
      periode: from && to ? { from, to } : 'toutes dates',
      ...kpis,
      note: 'Export CSV/PDF non implémenté — données brutes uniquement pour le moment.',
    };
  }
}
