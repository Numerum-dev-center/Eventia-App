import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from './entities/platform-setting.entity';

@Injectable()
export class PlatformSettingsService {
  constructor(
    @InjectRepository(PlatformSetting)
    private settingRepo: Repository<PlatformSetting>,
  ) {}

  async findAll() {
    return this.settingRepo.find({ order: { key: 'ASC' } });
  }

  async findByKey(key: string) {
    const setting = await this.settingRepo.findOne({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting '${key}' not found`);
    return setting;
  }

  async upsert(key: string, value: Record<string, any>, description?: string) {
    let setting = await this.settingRepo.findOne({ where: { key } });
    if (setting) {
      setting.value = value;
      if (description) setting.description = description;
    } else {
      setting = this.settingRepo.create({ key, value, description });
    }
    return this.settingRepo.save(setting);
  }

  async remove(key: string) {
    const setting = await this.settingRepo.findOne({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting '${key}' not found`);
    await this.settingRepo.remove(setting);
    return { message: `Setting '${key}' deleted` };
  }

  async getDefaults() {
    return {
      ticketing: {
        maxTicketsPerOrder: 10,
        allowTransfers: true,
        refundPolicy: 'full_refund_48h',
        ticketNaming: 'Billet',
      },
      payment: {
        acceptedMethods: ['MTN_MoMo', 'Moov_Money', 'Card', 'Cash'],
        currency: 'XOF',
        minAmount: 500,
        maxAmount: 500000,
      },
      notification: {
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: false,
      },
      general: {
        siteName: 'Eventia',
        supportEmail: 'support@eventia.com',
        maintenanceMode: false,
      },
    };
  }
}
