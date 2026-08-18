import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { userStorage } from '../services/user-content.service';

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Supposons que ton JWT place l'utilisateur dans req.user
    const userId = (req as any).user?.id; 
    userStorage.run(userId, () => next());
  }
}