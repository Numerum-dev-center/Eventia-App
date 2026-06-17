import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Evenement } from 'src/evenement/evenement.entity';
import { TicketEmis } from 'src/tickets/entities/ticket-emis.entity';

@Entity()
export class CategorieTicket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nom!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  prix!: number;

  @Column()
  quantiteTotale!: number;

  @Column()
  quantiteDisponible!: number;

  @Column({ nullable: true })
  limiteParPersonne?: number;

  // Relation : un événement contient plusieurs catégories de tickets
  @ManyToOne(() => Evenement, (evenement) => evenement.categoriesTickets)
  @JoinColumn({ name: 'evenement_id' })
  evenement!: Evenement;

  // Relation : une catégorie de ticket contient plusieurs tickets émis
  @OneToMany(() => TicketEmis, (ticket) => ticket.categorieTicket)
  ticketsEmis?: TicketEmis[];
}
