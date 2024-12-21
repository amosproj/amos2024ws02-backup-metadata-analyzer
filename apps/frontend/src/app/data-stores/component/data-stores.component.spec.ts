import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { of } from 'rxjs';
import { randomUUID } from 'crypto';
import { DataStoresComponent } from './data-stores.component';
import { DataStore } from '../../shared/types/data-store';

describe('DataStoresComponent', () => {
  let component: DataStoresComponent;
  let mockDataStoresService: {
    getAllDataStores: Mock;
  };

  beforeEach(() => {
    mockDataStoresService = {
      getAllDataStores: vi.fn(),
    };

    component = new DataStoresComponent(mockDataStoresService as any);
  });

  describe('loadDataStores', () => {
    it('should load data stores correctly', () => {
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

      mockDataStoresService.getAllDataStores.mockReturnValue(of(dataStores));

      component.loadDataStores();

      expect(component.dataStores).toEqual(dataStores);
      expect(component.showAll).toBeFalsy();
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
