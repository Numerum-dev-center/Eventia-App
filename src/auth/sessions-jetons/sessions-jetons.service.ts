import { Injectable } from '@nestjs/common';
import { CreateSessionsJetonDto } from './dto/create-sessions-jeton.dto';
import { UpdateSessionsJetonDto } from './dto/update-sessions-jeton.dto';

@Injectable()
export class SessionsJetonsService {
  create(createSessionsJetonDto: CreateSessionsJetonDto) {
    return 'This action adds a new sessionsJeton';
  }

  findAll() {
    return `This action returns all sessionsJetons`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sessionsJeton`;
  }

  update(id: number, updateSessionsJetonDto: UpdateSessionsJetonDto) {
    return `This action updates a #${id} sessionsJeton`;
  }

  remove(id: number) {
    return `This action removes a #${id} sessionsJeton`;
  }
}
