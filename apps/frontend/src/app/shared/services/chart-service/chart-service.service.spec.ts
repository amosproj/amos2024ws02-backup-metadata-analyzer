import { TestBed } from '@angular/core/testing';
import { ChartService } from './chart-service.service';
import { BehaviorSubject } from 'rxjs';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5percent from '@amcharts/amcharts5/percent';

describe('ChartService', () => {
  let service: ChartService;
  let mockRoot: any;
  let mockChart: any;
  let mockSeries: any;

  beforeEach(() => {
    // Mock am5.Root
    mockRoot = {
      container: {
        children: {
          push: vi.fn().mockReturnThis(),
        },
      },
      setThemes: vi.fn(),
      dispose: vi.fn(),
      verticalLayout: {},
    };

    // Mock chart instance
    mockChart = {
      series: {
        push: vi.fn().mockReturnThis(),
      },
      xAxes: {
        push: vi.fn(),
        getIndex: vi.fn(),
      },
      yAxes: {
        push: vi.fn(),
        getIndex: vi.fn(),
      },
      children: {
        unshift: vi.fn(),
      },
      set: vi.fn(),
      appear: vi.fn(),
    };

    // Mock series instance
    mockSeries = {
      data: {
        setAll: vi.fn(),
        clear: vi.fn(),
      },
      appear: vi.fn(),
      columns: {
        template: {
          setAll: vi.fn(),
          states: {
            create: vi.fn(),
          },
        },
      },
      events: {
        on: vi.fn(),
      },
    };

    // Spy on am5 methods
    vi.spyOn(am5, 'Root' as any).mockImplementation(() => mockRoot);
    vi.spyOn(am5xy, 'XYChart').mockImplementation(() => mockChart);
    vi.spyOn(am5percent, 'PieChart').mockImplementation(() => mockChart);

    TestBed.configureTestingModule({
      providers: [ChartService],
    });
    service = TestBed.inject(ChartService);
  });
  afterEach(() => {
    service.dispose();
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

/*   describe('createChart', () => {
    it('should create a column chart', () => {
      const config = {
        id: 'test-chart',
        type: 'column' as const,
        seriesName: 'Test Series',
      };
      const data$ = new BehaviorSubject([{ date: new Date(), value: 100 }]);

      service.createChart(config, data$, 'week');

      expect(am5.Root.new).toHaveBeenCalledWith('test-chart');
      expect(mockRoot.setThemes).toHaveBeenCalled();
      expect(mockChart.series.push).toHaveBeenCalled();
    });

    it('should create a pie chart', () => {
      const config = {
        id: 'test-pie',
        type: 'pie' as const,
        seriesName: 'Test Pie',
      };
      const data$ = new BehaviorSubject([
        { category: 'A', value: 30 },
        { category: 'B', value: 70 },
      ]);

      service.createChart(config, data$);

      expect(am5.Root.new).toHaveBeenCalledWith('test-pie');
      expect(mockRoot.setThemes).toHaveBeenCalled();
      expect(mockChart.series.push).toHaveBeenCalled();
    });
  }); */
});
