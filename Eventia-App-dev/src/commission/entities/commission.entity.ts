import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Event } from 'src/event/entities/event.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('commissions')
export class Commission extends BaseEntity {
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10.0 })
  rate!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  organizerPayout!: number;

  @Column({ default: false })
  isPaid!: boolean;

  @Column({ type: 'text', nullable: true })
  refusalReason?: string;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event!: Event;
}
