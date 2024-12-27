import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { BackupsComponent } from './backups.component';

describe('BackupsComponent', () => {
  let component: BackupsComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BackupsComponent],
    });

    component = TestBed.inject(BackupsComponent);
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
