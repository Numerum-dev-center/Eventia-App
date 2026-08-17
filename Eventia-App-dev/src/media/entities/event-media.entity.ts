import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from 'src/event/entities/event.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

@Entity('event_media')
export class EventMedia extends BaseEntity {
  @Column()
  filename!: string;

  @Column()
  originalName!: string;

  @Column()
  mimeType!: string;

  @Column({ type: 'bigint' })
  size!: number;

  @Column()
  url!: string;

  @Column({ type: 'enum', enum: MediaType, default: MediaType.IMAGE })
  type!: MediaType;

  @Column({ default: 0 })
  sortOrder!: number;

  @ManyToOne(() => Event, (event) => event.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: Event;
}
