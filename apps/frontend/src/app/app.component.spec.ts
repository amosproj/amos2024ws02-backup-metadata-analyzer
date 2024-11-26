import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClarityModule } from '@clr/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ClarityModule, RouterTestingModule, BrowserAnimationsModule],
      providers: [
        provideRouter([]),
      ],
      declarations: [AppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
  });

  afterEach(() => {
    if (fixture !== undefined) {
      fixture.destroy(); // Ensure the fixture is destroyed after each test
    }
  });

  it('should render title', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const titleElement = compiled.querySelector('h1');
    expect(titleElement).toBeDefined();
  });

  it(`should have as title 'metadata-analyzer-frontend'`, () => {
    fixture.detectChanges();
    const app = fixture.componentInstance;
    expect(app).toBeDefined();
    expect(app.title).toEqual('metadata-analyzer-frontend');
  });
});