import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Event } from 'src/event/entities/event.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

export enum PromoCodeType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('promo_codes')
export class PromoCode extends BaseEntity {
  @Column({ unique: true })
  code!: string;

  @Column({ type: 'enum', enum: PromoCodeType, default: PromoCodeType.PERCENTAGE })
  type!: PromoCodeType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value!: number;

  @Column({ nullable: true })
  maxUses?: number;

  @Column({ default: 0 })
  usedCount!: number;

  @Column({ type: 'timestamp', nullable: true })
  validFrom?: Date;

  @Column({ type: 'timestamp', nullable: true })
  validUntil?: Date;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(() => Event, { nullable: true })
  @JoinColumn({ name: 'event_id' })
  event?: Event;
}
