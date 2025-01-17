import { ClrDatagridFilterInterface } from '@clr/angular';
import { BackupType } from '../../../shared/enums/backup.types';
import { Subject } from 'rxjs';
import { Alert } from '../../../shared/types/alert';
import { SeverityType } from '../../../shared/enums/severityType';

export class CustomFilter implements ClrDatagridFilterInterface<Alert> {
  public ranges: {
    fromDate: string | null;
    toDate: string | null;
    severity: SeverityType | null;
    type: string | null;
    id: string | null;
  } = {
    fromDate: null,
    toDate: null,
    severity: null,
    type: null,
    id: null,
  };

  public changes = new Subject<any>();
  public filterType: 'date' | 'severity' | 'id' | 'type';

  constructor(filterType: 'date' | 'severity' | 'id' | 'type') {
    this.filterType = filterType;
  }

  isActive(): boolean {
    if (this.filterType === 'date') {
      return !!(this.ranges.fromDate || this.ranges.toDate);
    } else if (this.filterType === 'severity') {
      return !!this.ranges.severity;
    } else if (this.filterType === 'type') {
      return !!this.ranges.type;
    } else {
      return !!this.ranges.id;
    }
  }

  accepts(alert: Alert): boolean {
    return true;
  }

  updateRanges(ranges: Partial<typeof this.ranges>): void {
    Object.assign(this.ranges, ranges);
    this.changes.next(true);
  }
}
