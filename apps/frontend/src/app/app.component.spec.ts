import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ClarityModule } from '@clr/angular';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClarityModule, RouterTestingModule],
      declarations: [AppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'metadata-analyzer-frontend'
    );
  });

  it('should have as title "metadata-analyzer-frontend"', () => {
    const app = fixture.componentInstance;
    expect(app.title).toEqual('metadata-analyzer-frontend');
  });
});

import { NgModule } from '@angular/core';

@NgModule({
  exports: [],
})
class MockClarityModule {}

// Im Test dann:
beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [MockClarityModule, RouterTestingModule],
    declarations: [AppComponent],
  }).compileComponents();
});
