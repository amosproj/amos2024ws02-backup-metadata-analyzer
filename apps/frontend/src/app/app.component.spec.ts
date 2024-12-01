import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ClarityModule } from '@clr/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { AppComponent } from './app.component';
import { By } from '@angular/platform-browser';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ClarityModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
      ],
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
    const expectedNavItems = ['Dashboard', 'Overview', 'Upload', 'Find Data'];

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
    const expectedRoutes = ['/', '/', '/upload', '/findData'];

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
});
