import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionsJetons } from './entities/sessions-jeton.entity';
import { CreateSessionsJetonDto } from './dto/create-sessions-jeton.dto';
import { UpdateSessionsJetonDto } from './dto/update-sessions-jeton.dto';

@Injectable()
export class SessionsJetonsService {
  constructor(
    @InjectRepository(SessionsJetons)
    private readonly sessionsRepository: Repository<SessionsJetons>,
  ) {}

  async create(dto: CreateSessionsJetonDto): Promise<SessionsJetons> {
    const { utilisateur_id, ...sessionData } = dto;

    const session = this.sessionsRepository.create({
      ...sessionData,
      utilisateur: { id: utilisateur_id } as any, 
    });

    return await this.sessionsRepository.save(session);
  }

  async findByToken(token: string): Promise<SessionsJetons | null> {
    return await this.sessionsRepository.findOne({ where: { refresh_token_hash: token } });
  }

  async findAll(): Promise<SessionsJetons[]> {
    return await this.sessionsRepository.find();
  }

  async findOne(id: string): Promise<SessionsJetons> {
    const session = await this.sessionsRepository.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException(`Session #${id} introuvable`);
    }
    return session;
  }

  async update(
    id: string,
    dto: UpdateSessionsJetonDto,
  ): Promise<SessionsJetons> {
    const session = await this.findOne(id);
    Object.assign(session, dto);
    return await this.sessionsRepository.save(session);
  }

  async remove(id: string): Promise<void> {
    const session = await this.findOne(id);
    await this.sessionsRepository.remove(session);
  }

  // --- Méthodes Métier Utiles ---

  async findByHash(hash: string): Promise<SessionsJetons | null> {
    return await this.sessionsRepository.findOne({
      where: { refresh_token_hash: hash },
    });
  }

  async removeAllByUser(utilisateurId: string): Promise<void> {
   
    await this.sessionsRepository.delete({
    utilisateur: { id: utilisateurId } 
  });
  }
}
