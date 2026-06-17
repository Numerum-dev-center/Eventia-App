import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Commande } from 'src/commande/entities/commande.entity';
import { CategorieTicket } from 'src/categorie-ticket/entities/categorie-ticket.entity';
import { Utilisateur } from 'src/utilisateur/entities/utilisateur.entity';
import { StatutValidation } from 'src/common/statut-validation-ticket.enum';
import { LogValidationBillet } from 'src/controle-dacces/entities/log-validation-billet.entity';

@Entity()
export class TicketEmis {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  codeUniqueCrypto!: string;

  @Column({
    type: 'enum',
    enum: StatutValidation,
    default: StatutValidation.VALIDE,
  })
  statutValidation!: StatutValidation;

  @Column({ type: 'timestamp', nullable: true })
  scanneA?: Date;

  // Relation : une commande contient plusieurs tickets émis
  @ManyToOne(() => Commande, (commande) => commande.ticketsEmis)
  @JoinColumn({ name: 'commande_id' })
  commande!: Commande;

  // Relation : une catégorie de ticket contient plusieurs tickets émis
  @ManyToOne(() => CategorieTicket, (categorie) => categorie.ticketsEmis)
  @JoinColumn({ name: 'categorie_ticket_id' })
  categorieTicket!: CategorieTicket;

  // Relation : un utilisateur (agent de contrôle) scanne plusieurs tickets
  @ManyToOne(() => Utilisateur, { nullable: true })
  @JoinColumn({ name: 'scanne_par' })
  scannePar?: Utilisateur;

  @OneToMany(() => LogValidationBillet, (log) => log.billet)
  logsValidation!: LogValidationBillet[];
}
