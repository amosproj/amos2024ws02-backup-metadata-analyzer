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
    overflowTime: 10,
  },
  {
    id: randomUUID().toString(),
    displayName: 'test2',
    capacity: 100,
    filled: 80,
    highWaterMark: 80,
    overflowTime: 5,
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

      component.loadDataStores();

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
        overflowTime: 10,
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
        overflowTime: 10,
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

  describe('changeSortBy', () => {
    it('should change sortBy correctly and reload data stores', () => {
      const loadDataStoresSpy = vi.spyOn(component, 'loadDataStores');

      component.changeSortBy('overflowTime');

      expect(component.sortBy).toBe('overflowTime');
      expect(loadDataStoresSpy).toHaveBeenCalled();
    });
  });

  describe('sortDataStores', () => {
    it('should sort data stores by filled percentage correctly', () => {
      component.sortBy = 'filled';
      const sortedDataStores = component.sortDataStores(dataStores);

      expect(sortedDataStores[0].filled).toBe(80);
      expect(sortedDataStores[1].filled).toBe(50);
    });

    it('should sort data stores by overflow time correctly', () => {
      component.sortBy = 'overflowTime';
      const sortedDataStores = component.sortDataStores(dataStores);

      expect(sortedDataStores[0].overflowTime).toBe(5);
      expect(sortedDataStores[1].overflowTime).toBe(10);
    });
  });
});
