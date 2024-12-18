import { ClrDatagridFilterInterface } from '@clr/angular';
import { Subject } from 'rxjs';
import { EmailType } from '../../../../shared/types/email';

export class CustomEmailFilter implements ClrDatagridFilterInterface<EmailType> {
  public ranges: {
    mail: string | null;
    id: string | null;
  } = {
    mail: null,
    id: null,
  };

  public changes = new Subject<any>();
  public filterType: 'mail' | 'id';

  constructor(filterType: 'mail' | 'id') {
    this.filterType = filterType;
  }

  isActive(): boolean {
    if (this.filterType === 'mail') {
      return !!(this.ranges.mail || this.ranges.mail);
    } else if (this.filterType === 'id') {
      return !!(this.ranges.id || this.ranges.id);
    } else {
      return !!this.ranges.id;
    }
  }

  accepts(backup: EmailType): boolean {
    return true;
  }

  updateRanges(ranges: Partial<typeof this.ranges>): void {
    Object.assign(this.ranges, ranges);
    this.changes.next(true);
  }
}
