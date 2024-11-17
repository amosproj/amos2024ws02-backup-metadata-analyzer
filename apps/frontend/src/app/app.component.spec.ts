import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ClarityModule } from '@clr/angular';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

/*   beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockClarityModule, RouterTestingModule],
      declarations: [AppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }); */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] // This will allow any custom elements
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have as title "metadata-analyzer-frontend"', () => {
    const app = fixture.componentInstance;
    expect(app.title).toEqual('metadata-analyzer-frontend');
  });
});

