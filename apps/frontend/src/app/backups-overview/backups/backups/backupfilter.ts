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
    if (this.filterType === 'date') {
      const itemDate = new Date(backup.creationDate).getTime();
      const fromDate = this.ranges.fromDate
        ? new Date(this.ranges.fromDate).getTime()
        : -Infinity;
      const toDate = this.ranges.toDate
        ? new Date(this.ranges.toDate).getTime()
        : Infinity;
      return itemDate >= fromDate && itemDate <= toDate;
    } else {
      const itemSize = backup.sizeMB;
      const fromSize = this.ranges.fromSizeMB ?? -Infinity;
      const toSize = this.ranges.toSizeMB ?? Infinity;
      return itemSize >= fromSize && itemSize <= toSize;
    }
  }

  updateRanges(ranges: Partial<typeof this.ranges>): void {
    Object.assign(this.ranges, ranges);
    this.changes.next(true);
  }
}
