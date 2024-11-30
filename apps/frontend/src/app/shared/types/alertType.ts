// Possible types of alerts
import { SeverityType } from '../enums/severityType';

export class AlertType {
  id!: string;
  name!: string;
  severity!: SeverityType;
  user_active!: boolean;
  master_active!: boolean;
}
