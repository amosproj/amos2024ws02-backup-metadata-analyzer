import { BackupDataEntity } from '../../backupData/entity/backupData.entity';
import { AlertTypeEntity } from '../entity/alertType.entity';

export class AlertDto<T> {
  id: string;
  alertType: AlertTypeEntity; //Switch to alert type entity as soon as exists
  backup: BackupDataEntity;
  data: T;
}
