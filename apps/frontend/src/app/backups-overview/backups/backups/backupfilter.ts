import { ClrDatagridFilterInterface } from '@clr/angular';
import { Backup } from '../../../shared/types/backup';
import { Subject } from 'rxjs';
import { BackupType } from '../../../shared/enums/backup.types';

export class CustomFilter implements ClrDatagridFilterInterface<Backup> {
  public ranges: {
    fromDate: string | null;
    toDate: string | null;
    saveset: string | null;
    fromSizeMB: number | null;
    toSizeMB: number | null;
    id: string | null;
    taskName: string | null;
    type: BackupType[] | null;
    fromScheduledTime: string | null;
    toScheduledTime: string | null;
  } = {
    fromDate: null,
    toDate: null,
    fromSizeMB: null,
    toSizeMB: null,
    id: null,
    taskName: null,
    saveset: null,
    type: null,
    fromScheduledTime: null,
    toScheduledTime: null,
  };

  public changes = new Subject<any>();
  public filterType:
    | 'date'
    | 'size'
    | 'id'
    | 'taskName'
    | 'saveset'
    | 'type'
    | 'scheduledTime';

  constructor(
    filterType:
      | 'date'
      | 'size'
      | 'id'
      | 'taskName'
      | 'saveset'
      | 'type'
      | 'scheduledTime'
  ) {
    this.filterType = filterType;
  }

  isActive(): boolean {
    if (this.filterType === 'date') {
      return !!(this.ranges.fromDate || this.ranges.toDate);
    } else if (this.filterType === 'size') {
      return !!(this.ranges.fromSizeMB || this.ranges.toSizeMB);
    } else if (this.filterType === 'taskName') {
      return !!this.ranges.taskName;
    } else if (this.filterType === 'saveset') {
      return !!this.ranges.saveset;
    } else if (this.filterType === 'type') {
      return !!this.ranges.type;
    } else if (this.filterType === 'scheduledTime') {
      return !!(this.ranges.fromScheduledTime || this.ranges.toScheduledTime);
    } else {
      return !!this.ranges.id;
    }
  }

  accepts(backup: Backup): boolean {
    return true;
  }

  updateRanges(ranges: Partial<typeof this.ranges>): void {
    Object.assign(this.ranges, ranges);
    this.changes.next(true);
  }
}
