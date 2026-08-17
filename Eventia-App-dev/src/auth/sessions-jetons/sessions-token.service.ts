import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionsToken } from './entities/sessions-token.entity';
import { CreateSessionsTokenDto } from './dto/create-sessions-token.dto';
import { UpdateSessionsTokenDto } from './dto/update-sessions-token.dto';

@Injectable()
export class SessionsTokenService {
  constructor(
    @InjectRepository(SessionsToken)
    private readonly sessionsRepository: Repository<SessionsToken>,
  ) {}

  async create(dto: CreateSessionsTokenDto): Promise<SessionsToken> {
    const { userId, refreshTokenHash, deviceInfo, ipAdress, expirationDate } = dto;

    const session = this.sessionsRepository.create({
      refresh_token_hash: refreshTokenHash,
      deviceInfo,
      ipAdress,
      expirationDate,
      user: { id: userId } as any,
    });

    return await this.sessionsRepository.save(session);
  }

  async findByToken(token: string): Promise<SessionsToken | null> {
    return await this.sessionsRepository.findOne({ where: { refresh_token_hash: token } });
  }

  async findAll(): Promise<SessionsToken[]> {
    return await this.sessionsRepository.find();
  }

  async findOne(id: string): Promise<SessionsToken> {
    const session = await this.sessionsRepository.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException(`Session #${id} introuvable`);
    }
    return session;
  }

  async update(
    id: string,
    dto: UpdateSessionsTokenDto,
  ): Promise<SessionsToken> {
    const session = await this.findOne(id);
    Object.assign(session, dto);
    return await this.sessionsRepository.save(session);
  }

  async remove(id: string): Promise<void> {
    const session = await this.findOne(id);
    await this.sessionsRepository.remove(session);
  }

  // --- Méthodes Métier Utiles ---

  async findByHash(hash: string): Promise<SessionsToken | null> {
    return await this.sessionsRepository.findOne({
      where: { refresh_token_hash: hash },
    });
  }

  async removeAllByUser(utilisateurId: string): Promise<void> {
   
    await this.sessionsRepository.delete({
    user: { id: utilisateurId } 
  });
  }
}
