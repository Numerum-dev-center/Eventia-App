import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('platform_settings')
export class PlatformSetting extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  key!: string;

  @Column({ type: 'jsonb', default: '{}' })
  value!: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  description?: string;
}
