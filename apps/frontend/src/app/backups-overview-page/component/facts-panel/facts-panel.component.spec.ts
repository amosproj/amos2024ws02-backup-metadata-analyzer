import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { of } from 'rxjs';
import { FactsPanelComponent } from './facts-panel.component';
import { BasicInformation } from '../../../shared/types/basicInformation';

const mockInformations: BasicInformation = {
  numberOfBackups: 10,
  totalBackupSize: 100,
};
describe('FactsPanel', () => {
  let component: FactsPanelComponent;
  let mockInformationService: {
    getBasicInformations: Mock;
  };

  beforeEach(() => {
    mockInformationService = {
      getBasicInformations: vi.fn().mockReturnValue(of(mockInformations)),
    };

    component = new FactsPanelComponent(mockInformationService as any);
  });

  describe('basicInformations$', () => {
    it('should load basic informations correctly', (done) => {
      mockInformationService.getBasicInformations.mockReturnValue(
        of(mockInformations)
      );

      component.loadBasicInformations();

      component.basicInformations$.subscribe((result) => {
        expect(result).toEqual(mockInformations);
      });
    });
  });
});
