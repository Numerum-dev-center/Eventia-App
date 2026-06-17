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

@Entity()
export class Commande {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  // Relation : un client (utilisateur) passe plusieurs commandes
  @ManyToOne(() => Utilisateur, (user) => user.commandes)
  @JoinColumn({ name: 'client_id' })
  client!: Utilisateur;

  // Relation : une commande contient plusieurs tickets émis
  @OneToMany(() => TicketEmis, (ticket) => ticket.commande)
  ticketsEmis?: TicketEmis[];

  @OneToMany(() => Paiement, (paiement) => paiement.commande)
  paiements?: Paiement[];
}
