import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { of } from 'rxjs';
import { randomUUID } from 'crypto';
import { DataStoresComponent } from './data-stores.component';
import { DataStore } from '../../../shared/types/data-store';

const dataStores: DataStore[] = [
  {
    id: randomUUID().toString(),
    displayName: 'test',
    capacity: 100,
    filled: 50,
    highWaterMark: 80,
  },
  {
    id: randomUUID().toString(),
    displayName: 'test2',
    capacity: 100,
    filled: 80,
    highWaterMark: 80,
  },
];

describe('DataStoresComponent', () => {
  let component: DataStoresComponent;
  let mockDataStoresService: {
    getAllDataStores: Mock;
  };

  beforeEach(() => {
    mockDataStoresService = {
      getAllDataStores: vi.fn().mockReturnValue(of(dataStores)),
    };

    component = new DataStoresComponent(mockDataStoresService as any);
  });

  describe('dataStores$', () => {
    it('should load data stores correctly', (done) => {
      mockDataStoresService.getAllDataStores.mockReturnValue(of(dataStores));

      component.dataStores$.subscribe((result) => {
        expect(result).toEqual(dataStores);
      });
    });
  });

  describe('getFilledPercentage', () => {
    it('should return the filled percentage correctly', () => {
      const dataStore: DataStore = {
        id: randomUUID().toString(),
        displayName: 'test',
        capacity: 100,
        filled: 50,
        highWaterMark: 80,
      };

      expect(component.getFilledPercentage(dataStore)).toBe(50);
    });
  });

  describe('getHighWaterMarkPercentage', () => {
    it('should return the high water mark percentage correctly', () => {
      const dataStore: DataStore = {
        id: randomUUID().toString(),
        displayName: 'test',
        capacity: 100,
        filled: 50,
        highWaterMark: 80,
      };

      expect(component.getHighWaterMarkPercentage(dataStore)).toBe(80);
    });
  });

  describe('toggleShowAll', () => {
    it('should toggle showAll correctly', () => {
      component.showAll = false;

      component.toggleShowAll();

      expect(component.showAll).toBeTruthy();
    });
  });
});
