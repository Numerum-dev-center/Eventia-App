import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Utilisateur } from 'src/utilisateur/entities/utilisateur.entity';
import { TicketEmis } from 'src/tickets/entities/ticket-emis.entity';
import { StatutPaiement } from 'src/common/statut-paiement.enum';
import { Paiement } from 'src/paiement/entities/paiement.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class Commande extends BaseEntity {

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montantTotal!: number;

  @Column({
    type: 'enum',
    enum: StatutPaiement,
    default: StatutPaiement.EN_ATTENTE,
  })
  statutPaiement!: StatutPaiement;

  @Column({ nullable: true })
  transactionGatewayId?: string;

  @Column({ type: 'timestamp' })
  dateCommande!: Date;

  // Informations de l'acheteur pour une réservation sans compte (guest checkout)
  @Column({ nullable: true })
  buyerName?: string;

  @Column({ nullable: true })
  buyerEmail?: string;

  @Column({ nullable: true })
  buyerTelephone?: string;

  // Relation : un client (utilisateur) passe plusieurs commandes — optionnel,
  // une réservation peut se faire sans compte (guest checkout)
  @ManyToOne(() => Utilisateur, (user) => user.commandes, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client?: Utilisateur;

  // Relation : une commande contient plusieurs tickets émis
  @OneToMany(() => TicketEmis, (ticket) => ticket.commande)
  ticketsEmis?: TicketEmis[];

  @OneToMany(() => Paiement, (paiement) => paiement.commande)
  paiements?: Paiement[];
}
