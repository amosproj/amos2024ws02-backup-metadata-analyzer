import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BackupStatisticsPageComponent } from './backup-statistics-page.component';

describe('BackupStatisticsPageComponent', () => {
  let component: BackupStatisticsPageComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BackupStatisticsPageComponent],
    });

    component = TestBed.inject(BackupStatisticsPageComponent);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Filter Panel', () => {
    it('should toggle filter panel state', () => {
      expect(component['filterPanel']).toBe(false);

      component['changeFilterPanelState']();
      expect(component['filterPanel']).toBe(true);

      component['changeFilterPanelState']();
      expect(component['filterPanel']).toBe(false);
    });
  });
});
