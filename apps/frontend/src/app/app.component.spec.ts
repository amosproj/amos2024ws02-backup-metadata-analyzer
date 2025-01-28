import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppComponent } from './app.component';
import { By } from '@angular/platform-browser';
import { AnalyzerService } from './shared/services/analyzer-service/analyzer-service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockAnalyzerService: any;

  beforeEach(async () => {
    mockAnalyzerService = {
      refresh: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        ClarityModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
      ],
      providers: [{ provide: AnalyzerService, useValue: mockAnalyzerService }],
      declarations: [AppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct title', () => {
    expect(component.title).toBe('metadata-analyzer-frontend');
  });

  it('should render header with logo and title', () => {
    const headerElement = fixture.debugElement.query(By.css('.header'));
    expect(headerElement).toBeTruthy();

    const logoElement = fixture.debugElement.query(
      By.css('img[alt="Team Logo"]')
    );
    expect(logoElement).toBeTruthy();
    expect(logoElement.nativeElement.src).toContain('team_logo.png');

    const titleElement = fixture.debugElement.query(By.css('.title'));
    expect(titleElement).toBeTruthy();
    expect(titleElement.nativeElement.textContent).toBe('Metadata Analyzer');
  });

  it('should have navigation items', () => {
    const navItems = fixture.debugElement.queryAll(By.css('.nav-text'));
    const expectedNavItems = [
      'Dashboard',
      'Backup Statistics',
      'Analysis Overview',
      'How to get started?',
      
    ];

    // Use a Set to get unique nav item texts
    const uniqueNavItems = [
      ...new Set(navItems.map((item) => item.nativeElement.textContent.trim())),
    ];

    expect(uniqueNavItems.length).toBe(expectedNavItems.length);
    uniqueNavItems.forEach((navItem, index) => {
      expect(navItem).toBe(expectedNavItems[index]);
    });
  });

  it('should have router links configured', () => {
    const routerLinks = fixture.debugElement.queryAll(By.css('[routerLink]'));
    const expectedRoutes = [
      '/',
      '/',
      '/',
      '/backup-statistics',
      '/alert',
      '/user-manual',
      
    ];

    routerLinks.forEach((link, index) => {
      expect(link.nativeElement.getAttribute('routerLink')).toBe(
        expectedRoutes[index]
      );
    });
  });

  it('should have router outlet', () => {
    const routerOutlet = fixture.debugElement.query(By.css('router-outlet'));
    expect(routerOutlet).toBeTruthy();
  });

  it('should call analyzerService.refresh when refresh is called', () => {
    mockAnalyzerService.refresh.mockReturnValue(of({}));
    component.refresh();
    expect(mockAnalyzerService.refresh).toHaveBeenCalled();
  });

  it('should set isRefreshing to false if refresh fails', () => {
    mockAnalyzerService.refresh.mockReturnValue(of(new Error('Error')));
    component.refresh();
    expect(component.isRefreshing).toBe(false);
  });
});
