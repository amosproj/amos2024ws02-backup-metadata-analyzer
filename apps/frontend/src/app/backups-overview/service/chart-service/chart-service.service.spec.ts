import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChartService } from './chart-service.service';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5percent from '@amcharts/amcharts5/percent';
import { of } from 'rxjs';
import { id } from '@cds/core/internal';
import type { ChartConfig } from '../../../shared/types/chart-config';

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: () => ({
    save: () => {},
    restore: () => {},
    scale: () => {},
    clearRect: () => {},
    fillRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    fill: () => {},
    stroke: () => {},
    arc: () => {},
    fillText: () => {},
    measureText: () => ({ width: 0 }),
    setTransform: () => {},
    transform: () => {},
    translate: () => {},
    rotate: () => {},
    drawImage: () => {},
    createLinearGradient: () => ({
      addColorStop: () => {},
    }),
    createPattern: () => ({}),
    createRadialGradient: () => ({
      addColorStop: () => {},
    }),
    getImageData: () => ({
      data: [],
    }),
    putImageData: () => {},
    createImageData: () => ({}),
    getContextAttributes: () => ({}),
    isPointInPath: () => false,
    isPointInStroke: () => false,
    getLineDash: () => [],
    setLineDash: () => {},
    lineDashOffset: 0,
    imageSmoothingEnabled: false,
  }),
});

describe('ChartService', () => {
  let service: ChartService;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    service = new ChartService();
    const testContainer = document.createElement('div');
    testContainer.id = 'testContainer';
    document.body.appendChild(testContainer);
    canvas = document.createElement('canvas');
    testContainer.appendChild(canvas);
  });

  afterEach(() => {
    const testContainer = document.getElementById('testContainer');
    if (testContainer) {
      document.body.removeChild(testContainer);
    }
  });

  describe('prepareColumnData', () => {
    it('should return empty array for empty backups', () => {
      const result = service['prepareColumnData']([], 'week');
      expect(result).toEqual([]);
    });

    it('should group backups by week', () => {
      const backups = [
        {
          id: '1',
          creationDate: new Date('2023-01-15'),
          sizeMB: 100,
        },
        {
          id: '2',
          creationDate: new Date('2023-01-16'),
          sizeMB: 200,
        },
      ];

      const result = service['prepareColumnData'](backups, 'week');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('creationDate');
      expect(result[0]).toHaveProperty('sizeMB');
    });
  });

  describe('preparePieData', () => {
    it('should categorize backups by size ranges', () => {
      const backups = [
        { id: '1', creationDate: new Date(), sizeMB: 50 },
        { id: '2', creationDate: new Date(), sizeMB: 250 },
        { id: '3', creationDate: new Date(), sizeMB: 750 },
        { id: '4', creationDate: new Date(), sizeMB: 1500 },
      ];

      const result = service['preparePieData'](backups);
      expect(result).toEqual([
        { category: '0-100 MB', value: 1 },
        { category: '100-500 MB', value: 1 },
        { category: '500MB-1GB', value: 1 },
        { category: '>1GB', value: 1 },
      ]);
    });
  });
  describe('getGroupKey', () => {
    it('should return correct group key for different time ranges', () => {
      const date = new Date('2023-01-15');

      const weekKey = service['getGroupKey'](date, 'week');
      expect(weekKey).toBe('2023-01-15');

      const monthKey = service['getGroupKey'](date, 'month');
      expect(monthKey).toBe('2023-01-15');

      const yearKey = service['getGroupKey'](date, 'year');
      expect(yearKey).toMatch(/^\d{4}-W\d+$/);
    });
  });

  describe('getBaseInterval', () => {
    it('should return correct base interval for different time ranges', () => {
      const weekInterval = service['getBaseInterval']('week');
      expect(weekInterval).toEqual({ timeUnit: 'hour', count: 4 });

      const monthInterval = service['getBaseInterval']('month');
      expect(monthInterval).toEqual({ timeUnit: 'day', count: 1 });

      const yearInterval = service['getBaseInterval']('year');
      expect(yearInterval).toEqual({ timeUnit: 'week', count: 1 });
    });
  });

  describe('createChart', () => {
    it('should create a chart with valid configuration', () => {
      const mockRoot = {
        verticalLayout: {},
        container: { children: { push: vi.fn() } },
        setThemes: vi.fn(),
      } as unknown as am5.Root;

      const mockConfig: ChartConfig = {
        id: 'test-chart',
        type: 'column',
        seriesName: 'Test Series',
      };

      vi.spyOn(service as any, 'initializeRoot').mockReturnValue(mockRoot);
      vi.spyOn(service as any, 'initializeChart').mockReturnValue({});
      vi.spyOn(service as any, 'createSeries').mockReturnValue({});
      vi.spyOn(service as any, 'addChartControls').mockImplementation(() => {});
      vi.spyOn(service as any, 'subscribeToData').mockImplementation(() => {});
      vi.spyOn(service as any, 'animateChart').mockImplementation(() => {});

      service.createChart(mockConfig, of([]), 'week');

      expect(service['initializeRoot']).toHaveBeenCalledWith('test-chart');
      expect(service['initializeChart']).toHaveBeenCalled();
      expect(service['createSeries']).toHaveBeenCalled();
    });
  });

  describe('dispose', () => {
    it('should dispose of all roots and reset service state', () => {
      const mockRoot = { dispose: vi.fn() };
      service['roots'] = { 'test-chart': mockRoot as any };

      service.dispose();

      expect(mockRoot.dispose).toHaveBeenCalled();
      expect(service['roots']).toEqual({});
      expect(service['charts']).toEqual({});
      expect(service['series']).toEqual({});
      expect(service['modals']).toEqual({});
    });
  });


  describe('initializeRoot', () => {
    it('should initialize the root correctly', () => {
      const containerId = 'testContainer';
      const root = service['initializeRoot'](containerId);
  
      expect(root).toBeDefined();
      expect(service['roots'][containerId]).toBe(root);
    });
  
    it('should dispose of the existing root if it exists', () => {
      const containerId = 'testContainer';
      const existingRoot = am5.Root.new(containerId);
      service['roots'][containerId] = existingRoot;
  
      const newRoot = service['initializeRoot'](containerId);
  
      expect(newRoot).toBeDefined();
      expect(service['roots'][containerId]).toBe(newRoot);
      expect(existingRoot.isDisposed()).toBe(true);
    });
  });
});
