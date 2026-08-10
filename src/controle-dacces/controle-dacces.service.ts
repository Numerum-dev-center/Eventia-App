import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogValidationBillet } from './entities/log-validation-billet.entity';
import { TicketEmis } from 'src/tickets/entities/ticket-emis.entity';
import { StatutValidation } from 'src/common/statut-validation-ticket.enum';
import { ScanTicketDto } from './dto/scan-ticket.dto';

@Injectable()
export class ControleDaccesService {
  constructor(
    @InjectRepository(LogValidationBillet)
    private logRepository: Repository<LogValidationBillet>,
    @InjectRepository(TicketEmis)
    private ticketRepository: Repository<TicketEmis>,
  ) {}

  async scanner(
    dto: ScanTicketDto,
    scannePar: string,
    organisateurId: string,
  ) {
    const ticket = await this.ticketRepository.findOne({
      where: { codeUniqueCrypto: dto.codeUniqueCrypto },
      relations: { categorieTicket: { evenement: { profilOrganisateur: true } } },
    });

    const localisation = dto.localisation || 'Entrée principale';

    if (!ticket) {
      // Pas de billet réel à rattacher : on ne peut pas journaliser en base
      // (la relation billet est obligatoire), on renvoie juste l'échec.
      return { ok: false, message: 'Code de billet introuvable' };
    }

    if (ticket.categorieTicket.evenement.id !== dto.evenementId) {
      return { ok: false, message: "Ce billet n'appartient pas à cet événement" };
    }

    if (
      ticket.categorieTicket.evenement.profilOrganisateur.id !== organisateurId
    ) {
      throw new ForbiddenException("Cet événement ne vous appartient pas");
    }

    if (ticket.statutValidation === StatutValidation.SCANNE) {
      await this.logRepository.save(
        this.logRepository.create({
          billetId: ticket.id,
          appareilId: scannePar,
          localisation,
          estSucces: false,
          messageErreur: 'Billet déjà scanné',
          billet: ticket,
        }),
      );
      return {
        ok: false,
        message: `Billet déjà scanné le ${ticket.scanneA?.toLocaleString('fr-FR')}`,
      };
    }

    ticket.statutValidation = StatutValidation.SCANNE;
    ticket.scanneA = new Date();
    await this.ticketRepository.save(ticket);

    await this.logRepository.save(
      this.logRepository.create({
        billetId: ticket.id,
        appareilId: scannePar,
        localisation,
        estSucces: true,
        billet: ticket,
      }),
    );

    return { ok: true, message: 'Billet validé', ticket };
  }

  async journalByEvenement(evenementId: string) {
    return this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.billet', 'billet')
      .leftJoin('billet.categorieTicket', 'categorie')
      .leftJoin('categorie.evenement', 'evenement')
      .where('evenement.id = :evenementId', { evenementId })
      .orderBy('log.createdAt', 'DESC')
      .getMany();
  }
}
