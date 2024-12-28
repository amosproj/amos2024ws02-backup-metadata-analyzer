import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { OverviewPageComponent } from './overview-page.component';

describe('OverviewPageComponent', () => {
  let component: OverviewPageComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OverviewPageComponent],
    });

    component = TestBed.inject(OverviewPageComponent);
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

  describe('Information Panel', () => {
    it('should toggle information panel state', () => {
      expect(component['isInfoPanelOpen']).toBe(false);

      component['toggleInfoPanel']();
      expect(component['isInfoPanelOpen']).toBe(true);

      component['toggleInfoPanel']();
      expect(component['isInfoPanelOpen']).toBe(false);
    });
  });
});
