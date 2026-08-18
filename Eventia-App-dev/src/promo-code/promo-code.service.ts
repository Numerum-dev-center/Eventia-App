import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCode, PromoCodeType } from './entities/promo-code.entity';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';

@Injectable()
export class PromoCodeService {
  constructor(
    @InjectRepository(PromoCode)
    private promoCodeRepository: Repository<PromoCode>,
  ) {}

  private readonly logger = new Logger(PromoCodeService.name);

  async create(dto: CreatePromoCodeDto): Promise<PromoCode> {
    const promoCode = this.promoCodeRepository.create({
      code: dto.code.toUpperCase(),
      type: dto.type,
      value: dto.value,
      maxUses: dto.maxUses,
      validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      event: dto.eventId ? { id: dto.eventId } : undefined,
    });
    return await this.promoCodeRepository.save(promoCode);
  }

  async findAll(): Promise<PromoCode[]> {
    return await this.promoCodeRepository.find({
      relations: { event: true },
      order: { createdAt: 'DESC' },
    });
  }

  async validate(code: string, eventId: string): Promise<{ valid: boolean; discount: number; type: PromoCodeType }> {
    const promoCode = await this.promoCodeRepository.findOne({
      where: { code: code.toUpperCase() },
      relations: { event: true },
    });

    if (!promoCode || !promoCode.isActive) {
      throw new NotFoundException('Code promo invalide ou inactif');
    }

    if (promoCode.event && promoCode.event.id !== eventId) {
      throw new BadRequestException("Ce code promo n'est pas applicable à cet événement");
    }

    const now = new Date();
    if (promoCode.validFrom && now < promoCode.validFrom) {
      throw new BadRequestException("Ce code promo n'est pas encore actif");
    }
    if (promoCode.validUntil && now > promoCode.validUntil) {
      throw new BadRequestException('Ce code promo a expiré');
    }

    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      throw new BadRequestException("Ce code promo a atteint son nombre d'utilisations maximum");
    }

    return {
      valid: true,
      discount: Number(promoCode.value),
      type: promoCode.type,
    };
  }

  async apply(id: string): Promise<void> {
    const promoCode = await this.promoCodeRepository.findOne({ where: { id } });
    if (!promoCode) {
      throw new NotFoundException(`Code promo #${id} non trouvé`);
    }
    promoCode.usedCount += 1;
    await this.promoCodeRepository.save(promoCode);
  }

  async remove(id: string): Promise<void> {
    const promoCode = await this.promoCodeRepository.findOne({ where: { id } });
    if (!promoCode) {
      throw new NotFoundException(`Code promo #${id} non trouvé`);
    }
    await this.promoCodeRepository.remove(promoCode);
  }
}
