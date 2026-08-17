import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('event_categories')
export class EventCategory extends BaseEntity {
  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  slug!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  icon?: string;

  @Column({ default: true })
  isActive!: boolean;
}
