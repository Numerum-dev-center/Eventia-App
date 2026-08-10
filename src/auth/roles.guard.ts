import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './decorators/roles.decorator';
import { Role } from 'src/common/role.enum';
import { Request } from 'express'; 
import { User } from 'src/user/entities/user.entity'; 

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    // On récupère la requête et on force le typage de l'utilisateur
    const request = context.switchToHttp().getRequest<Request>();
    
    // Ici, on cast 'user' pour qu'il corresponde à ton entité Utilisateur
    const user = request.user as User;

    // Maintenant TypeScript sait que 'user' a une propriété 'role'
    return requiredRoles.includes(user.role);
  }
}