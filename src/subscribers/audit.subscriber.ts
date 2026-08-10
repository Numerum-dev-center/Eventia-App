import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from 'typeorm';
import { AuditLog } from 'src/logs-audit/entities/audit-log.entity';
import { userStorage } from 'src/common/services/user-content.service';

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  
  // Cette méthode s'exécute après chaque insertion dans n'importe quelle entité
  async afterInsert(event: InsertEvent<any>) {
    await this.saveLog(event, 'INSERT');
  }

  // Cette méthode s'exécute après chaque mise à jour
  async afterUpdate(event: UpdateEvent<any>) {
    await this.saveLog(event, 'UPDATE');
  }

  private async saveLog(event: InsertEvent<any> | UpdateEvent<any>, action: string) {
  if (event.metadata.target === AuditLog) return;

  const logRepository = event.manager.getRepository(AuditLog);

  let targetId: string = 'unknown';
  let changes: any;

  // Utilisation de la vérification de type pour satisfaire TypeScript
  if (action === 'INSERT') {
    const insertEvent = event as InsertEvent<any>;
    // On récupère l'ID via l'entité insérée
    targetId = insertEvent.entity?.id || 'unknown';
    changes = insertEvent.entity;
  } else {
    const updateEvent = event as UpdateEvent<any>;
    // Pour l'update, on utilise la base de données
    targetId = updateEvent.databaseEntity?.id || 'unknown';
    changes = {
      before: updateEvent.databaseEntity,
      after: updateEvent.entity,
    };
  }

  const userId = userStorage.getStore();
  const log = logRepository.create({
    targetEntity: event.metadata.name,
    targetId: targetId,
    action: action,
    changes: changes,
    userId: userId,
  });

  await logRepository.save(log);
}
}