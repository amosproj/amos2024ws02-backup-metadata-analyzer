import { ClrDatagridFilterInterface } from '@clr/angular';
import { Backup } from '../../../shared/types/backup';
import { Subject } from 'rxjs';

export class CustomFilter implements ClrDatagridFilterInterface<Backup> {
  public ranges: {
    fromDate: string | null;
    toDate: string | null;
    fromSizeMB: number | null;
    toSizeMB: number | null;
  } = {
    fromDate: null,
    toDate: null,
    fromSizeMB: null,
    toSizeMB: null,
  };

  public changes = new Subject<any>();
  public filterType: 'date' | 'size';

  constructor(filterType: 'date' | 'size') {
    this.filterType = filterType;
  }

  isActive(): boolean {
    if (this.filterType === 'date') {
      return !!(this.ranges.fromDate || this.ranges.toDate);
    } else {
      return !!(this.ranges.fromSizeMB || this.ranges.toSizeMB);
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
